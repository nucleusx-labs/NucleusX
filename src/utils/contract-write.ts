import {
  encodeFunctionData,
  type Abi,
  type Address,
} from 'viem'
import { Binary, FixedSizeBinary, type PolkadotSigner } from 'polkadot-api'
import { typedApi } from './client'
import { ensureMapped } from './map-account'

function collectErrorText(input: unknown): string {
  if (input == null) return ''
  if (typeof input === 'string') return input
  if (
    typeof input === 'number'
    || typeof input === 'boolean'
    || typeof input === 'bigint'
  ) {
    return String(input)
  }
  if (Array.isArray(input)) {
    return input.map(item => collectErrorText(item)).join(' ')
  }
  if (typeof input === 'object') {
    return Object.values(input as Record<string, unknown>)
      .map(value => collectErrorText(value))
      .join(' ')
  }
  return ''
}

function formatDispatchError(dispatchError: unknown): string {
  if (!dispatchError || typeof dispatchError !== 'object') {
    return String(dispatchError ?? 'unknown dispatch error')
  }
  const maybeDispatch = dispatchError as { type?: unknown; value?: unknown }
  if (
    typeof maybeDispatch.type === 'string'
    && maybeDispatch.value
    && typeof maybeDispatch.value === 'object'
  ) {
    const nested = maybeDispatch.value as { type?: unknown }
    if (typeof nested.type === 'string') {
      return `${maybeDispatch.type}.${nested.type}`
    }
  }
  const text = collectErrorText(dispatchError).trim()
  return text || 'unknown dispatch error'
}

/**
 * Write to a Solidity contract via pallet-revive's Revive.call extrinsic.
 *
 * Flow:
 * 1. Encode calldata with viem
 * 2. Ensure account is mapped (map_account)
 * 3. Dry-run for gas estimation via ReviveApi.call
 * 4. Submit via Revive.call extrinsic with a 25% gas buffer
 */
export async function contractWrite({
  address,
  abi,
  functionName,
  args = [],
  value = 0n,
  signer,
  ss58Address,
}: {
  address: Address
  abi: Abi | readonly unknown[]
  functionName: string
  args?: unknown[]
  value?: bigint
  signer: PolkadotSigner
  ss58Address: string
}): Promise<{ txHash: string; ok: boolean; events: unknown[] }> {
  if (ss58Address.startsWith('0x')) {
    throw new Error(
      'QF contract writes require a Substrate SS58 account. Select a Polkadot account in Talisman/SubWallet, not an Ethereum account.',
    )
  }

  // 1. Encode calldata
  const calldata = encodeFunctionData({
    abi: abi as Abi,
    functionName,
    args,
  })

  const dest = FixedSizeBinary.fromHex(address)
  const inputData = Binary.fromHex(calldata)

  // 2. Ensure account mapping
  await ensureMapped(signer, ss58Address)

  // Permissive storage deposit cap — must be supplied to both the dry-run and the
  // actual extrinsic.  When undefined the runtime defaults to 0, which causes any
  // call that internally deploys a contract (e.g. UniswapV2 factory.createPair via
  // addLiquidityETH) to trap with ContractTrapped because the CREATE2 sub-call
  // cannot charge any storage deposit.
  const STORAGE_DEPOSIT_LIMIT = 10_000_000_000_000_000n

  // High gas limit for dry-run — must be explicit. The runtime default (~200M ref_time)
  // is too low for calls that deploy sub-contracts (e.g. UniswapV2 factory.createPair
  // via addLiquidityETH). Without enough gas the EVM runs out mid-CREATE2 and traps,
  // which shows up as ContractTrapped with gas_consumed === gas_required.
  const DRY_RUN_GAS_LIMIT = { ref_time: 500_000_000_000n, proof_size: 6_291_456n }

  // 3. Dry-run for gas estimation
  console.log('[contractWrite] dry-run', { functionName, address, ss58Address, value })
  const dryRunResult = await (typedApi as any).apis.ReviveApi.call(
    ss58Address,
    dest,
    value,
    DRY_RUN_GAS_LIMIT,
    STORAGE_DEPOSIT_LIMIT,
    inputData,
  )

  const dryRun = dryRunResult as any
  console.log('[contractWrite] dry-run result', dryRun)

  // Check for dry-run dispatch errors
  // QF network returns { success: bool, value } but standard papi uses { type: 'Ok'|'Err', value }
  const dryRunFailed = dryRun.result?.success === false || dryRun.result?.type === 'Err'
  if (dryRunFailed) {
    const errValue = dryRun.result?.value
    console.error('[contractWrite] dry-run failed, full error:', JSON.stringify(
      errValue,
      (_, v) => typeof v === 'bigint' ? v.toString() : v,
      2,
    ))
    throw new Error(`Contract dry-run failed: ${formatDispatchError(errValue)}`)
  }

  // innerResult is the ExecReturnValue: { flags, data }
  const innerResult = dryRun.result?.value ?? dryRun.result
  console.log('[contractWrite] inner exec result', innerResult)
  const returnFlags = Number(innerResult?.flags ?? 0)
  if ((returnFlags & 1) === 1) {
    const revertHex: string = innerResult?.data?.asHex?.() ?? ''
    console.error('[contractWrite] contract reverted, revert hex:', revertHex)
    // Decode ABI-encoded Error(string) revert reason (selector 0x08c379a0)
    let revertReason = ''
    if (revertHex.startsWith('0x08c379a0')) {
      try {
        const hexBody = revertHex.slice(10) // strip '0x' + 4-byte selector
        const bytes = new Uint8Array(hexBody.match(/.{2}/g)!.map(b => parseInt(b, 16)))
        const msgLen = Number(BigInt('0x' + Array.from(bytes.slice(32, 64)).map(b => b.toString(16).padStart(2, '0')).join('')))
        revertReason = new TextDecoder().decode(bytes.slice(64, 64 + msgLen))
      } catch { /* ignore decode errors */ }
    }
    throw new Error(
      `Contract call would revert: ${functionName} on ${address}`
      + (revertReason ? ` — "${revertReason}"` : (revertHex ? ` (data: ${revertHex.slice(0, 66)})` : '')),
    )
  }

  // Add 25% buffer to gas estimate
  const gasRequired = dryRun.gas_required ?? dryRun.gas_consumed
  const gasLimit = {
    ref_time: (BigInt(gasRequired.ref_time) * 125n) / 100n,
    proof_size: (BigInt(gasRequired.proof_size) * 125n) / 100n,
  }

  // Use the same fixed cap for the actual extrinsic — the dry-run value is
  // unreliable for calls that create new contracts (returns 0 or Refund).
  const storageDeposit = STORAGE_DEPOSIT_LIMIT

  console.log('[contractWrite] submitting', { functionName, address, gasLimit, storageDeposit })

  // 4. Submit the transaction
  const result = await (typedApi as any).tx.Revive.call({
    dest,
    value,
    gas_limit: gasLimit,
    storage_deposit_limit: storageDeposit,
    data: inputData,
  }).signAndSubmit(signer, { withSignedTransaction: false })

  console.log('[contractWrite] result', result)

  if (!result.ok) {
    throw new Error(`Revive.call failed: ${formatDispatchError(result.dispatchError)}`)
  }

  return {
    txHash: result.txHash,
    ok: result.ok,
    events: result.events ?? [],
  }
}
