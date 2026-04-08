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

  // 3. Dry-run for gas estimation
  console.log('[contractWrite] dry-run', { functionName, address, ss58Address, value })
  const dryRunResult = await (typedApi as any).apis.ReviveApi.call(
    ss58Address,
    dest,
    value,
    undefined,
    undefined,
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
    console.error('[contractWrite] contract reverted, return data:', innerResult?.data)
    throw new Error(`Contract call would revert: ${functionName} on ${address}`)
  }

  // Add 25% buffer to gas estimate
  const gasRequired = dryRun.gas_required ?? dryRun.gas_consumed
  const gasLimit = {
    ref_time: (BigInt(gasRequired.ref_time) * 125n) / 100n,
    proof_size: (BigInt(gasRequired.proof_size) * 125n) / 100n,
  }

  // Storage deposit: extract value from Charge variant
  let storageDeposit: bigint | undefined
  if (dryRun.storage_deposit?.type === 'Charge') {
    const depositValue = dryRun.storage_deposit.value
    if (typeof depositValue === 'bigint' && depositValue > 0n) {
      storageDeposit = (depositValue * 125n) / 100n
    }
  }

  console.log('[contractWrite] submitting', { functionName, address, gasLimit, storageDeposit })

  // 4. Submit the transaction
  const result = await (typedApi as any).tx.Revive.call({
    dest,
    value,
    gas_limit: gasLimit,
    storage_deposit_limit: storageDeposit,
    data: inputData,
  }).signAndSubmit(signer)

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
