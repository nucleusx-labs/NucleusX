import type { Abi, ContractFunctionArgs, ContractFunctionName } from 'viem'
import type { PolkadotSigner, TypedApi } from 'polkadot-api'
import { Binary, FixedSizeBinary } from 'polkadot-api'
import { decodeFunctionResult, encodeFunctionData } from 'viem'

/**
 * Revive API types for contract interactions
 */
export interface ReviveCallOptions {
  origin: string // SS58 address of the caller
  dest: string // Contract address (SS58 or EVM format)
  value: bigint // Value to transfer (in plancks)
  gasLimit?: bigint
  storageDepositLimit?: bigint
  calldata: `0x${string}` // Encoded function call data
}

export interface ReviveCallResult {
  result:
    | { ok: { flags: number; data: `0x${string}` }; err?: never }
    | { ok?: never; err: { error: string } }
  gas_consumed: { ref_time: bigint; proof_size: bigint }
  gas_required: { ref_time: bigint; proof_size: bigint }
  storage_deposit: { value: bigint }
  debug_message: unknown
}

export interface ReviveTransactionOptions {
  dest: string // Contract address
  value: bigint // Value to transfer
  gasLimit: { ref_time: bigint; proof_size: bigint }
  storageDepositLimit?: bigint
  data: `0x${string}` // Encoded calldata
  signer: PolkadotSigner
}

export interface TransactionCallbacks {
  onTxHash?: (hash: string) => void
  onFinalized: () => void
  onError: (error: string) => void
  onBroadcast?: () => void
}

/**
 * Encode a contract function call into EVM ABI calldata using viem.
 * Chain interaction is still handled by polkadot-api / Revive.
 */
export function encodeContractCall<
  TAbi extends Abi,
  TFunctionName extends ContractFunctionName<TAbi>,
>(
  abi: TAbi,
  functionName: TFunctionName,
  args?: ContractFunctionArgs<TAbi, 'pure' | 'view' | 'nonpayable' | 'payable', TFunctionName>,
): `0x${string}` {
  return encodeFunctionData({ abi, functionName, args } as Parameters<typeof encodeFunctionData>[0])
}

/**
 * Decode a contract call result using viem.
 */
export function decodeContractResult<
  TAbi extends Abi,
  TFunctionName extends ContractFunctionName<TAbi>,
>(
  abi: TAbi,
  functionName: TFunctionName,
  data: `0x${string}`,
) {
  return decodeFunctionResult({ abi, functionName, data } as Parameters<typeof decodeFunctionResult>[0])
}

/**
 * Perform a read-only contract call (similar to eth_call)
 * Uses the ReviveApi.call runtime API
 */
export async function callContract(
  api: TypedApi<any>,
  options: ReviveCallOptions,
): Promise<ReviveCallResult> {
  const { origin, dest, value, calldata } = options

  // Convert dest (EVM hex address) to FixedSizeBinary<20> as required by the runtime API
  const destHex = dest.startsWith('0x') ? dest.slice(2) : dest
  const destFixed = FixedSizeBinary.fromArray(
    destHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)),
  )

  // Convert calldata hex string to Binary as required by the runtime API
  const inputData = Binary.fromHex(calldata)

  // Call the ReviveApi runtime API.
  // Pass a high explicit gas limit — passing undefined lets the runtime pick a default
  // that may be too low for complex calls like addLiquidity + pair creation.
  // The runtime silently caps this at the block max so a large value is safe.
  const DRY_RUN_GAS_LIMIT = { ref_time: 500_000_000_000n, proof_size: 6_291_456n }
  console.log('[Revive] dry-run call', { origin, dest, value })
  const raw = await (api.apis.ReviveApi.call as any)(
    origin,
    destFixed,
    value,
    DRY_RUN_GAS_LIMIT,
    undefined, // storageDepositLimit
    inputData,
  )
  console.log('[Revive] dry-run raw result', raw)

  // PAPI represents Result<T, E> as { value: T } for the Ok variant.
  // Normalize into the typed ReviveCallResult shape expected by callers.
  const inner = raw.result as Record<string, unknown>
  const okValue = (inner?.value ?? inner) as { data?: { asHex(): `0x${string}` }; flags?: number } | undefined

  let normalizedResult: ReviveCallResult['result']
  if (okValue?.data) {
    normalizedResult = { ok: { flags: okValue.flags ?? 0, data: okValue.data.asHex() } }
  }
  else {
    normalizedResult = { err: { error: 'Contract call failed or returned no data' } }
  }

  return { ...raw, result: normalizedResult } as ReviveCallResult
}

/**
 * Submit a contract transaction (state-changing call)
 * Uses Revive.call extrinsic
 */
export async function submitContractTransaction(
  api: TypedApi<any>,
  options: ReviveTransactionOptions,
  callbacks: TransactionCallbacks,
): Promise<() => void> {
  const { dest, value, gasLimit, storageDepositLimit, data, signer } = options

  const destHex = dest.startsWith('0x') ? dest.slice(2) : dest
  const destFixed = FixedSizeBinary.fromArray(
    destHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)),
  )
  const inputData = Binary.fromHex(data)

  console.log('[Revive] Submitting tx', {
    dest,
    value,
    gas_limit: gasLimit,
    storage_deposit_limit: storageDepositLimit,
    data,
  })

  // Build the revive.call extrinsic
  const tx = (api.tx.Revive.call as any)({
    dest: destFixed,
    value,
    gas_limit: gasLimit,
    storage_deposit_limit: storageDepositLimit,
    data: inputData,
  })

  // Sign, submit and watch for lifecycle events
  const unsub = tx.signSubmitAndWatch(signer, { withSignedTransaction: false }).subscribe({
    next: (event: any) => {
      console.log('[Revive] tx event', event)
      switch (event.type) {
        case 'txBestBlocksState':
          if (event.found) {
            console.log('[Revive] tx in best block, hash:', event.txHash)
            callbacks.onTxHash?.(event.txHash)
          }
          break
        case 'finalized':
          if (event.ok === false) {
            console.error('[Revive] tx finalized with error', event)
            callbacks.onError('Transaction failed on-chain')
          }
          else {
            console.log('[Revive] tx finalized ok, hash:', event.txHash)
            callbacks.onFinalized()
          }
          unsub.unsubscribe()
          break
      }
    },
    error: (err: any) => {
      console.error('[Revive] tx subscription error:', err)
      callbacks.onError(err instanceof Error ? err.message : 'Unknown error')
      unsub.unsubscribe()
    },
  })

  // Return unsubscribe function for manual cancellation
  return () => unsub.unsubscribe()
}

/**
 * Perform a dry-run to estimate gas consumption
 */
export async function estimateGas(
  api: TypedApi<any>,
  options: ReviveCallOptions,
): Promise<{
  gasConsumed: { ref_time: bigint; proof_size: bigint }
  gasRequired: { ref_time: bigint; proof_size: bigint }
}> {
  const result = await callContract(api, options)

  console.log('[Revive] gas estimate', {
    dest: options.dest,
    consumed: result.gas_consumed,
    required: result.gas_required,
    storageDeposit: result.storage_deposit,
    result: result.result,
  })

  return {
    gasConsumed: result.gas_consumed,
    gasRequired: result.gas_required,
  }
}

/**
 * Get the EVM (H160) address associated with a Substrate SS58 account.
 * The mapping is registered on-chain via the revive.mapAccount extrinsic.
 */
export async function checkAccountMapping(
  api: TypedApi<any>,
  address: string,
): Promise<{ isMapped: boolean, evmAddress?: string }> {
  try {
    const h160 = await (api.apis.ReviveApi.address as any)(address)
    if (h160) {
      return {
        isMapped: true,
        evmAddress: h160.asHex(),
      }
    }
    return { isMapped: false }
  }
  catch {
    return { isMapped: false }
  }
}

/**
 * Format SS58 address for display
 */
export function formatSS58Address(address: string, length = 6): string {
  if (!address) return ''
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

/**
 * Convert plancks to human-readable token amount
 */
export function fromPlancks(plancks: bigint, decimals: number): string {
  return (Number(plancks) / 10 ** decimals).toString()
}

/**
 * Convert human-readable amount to plancks
 */
export function toPlancks(amount: string, decimals: number): bigint {
  return BigInt(Math.floor(Number(amount) * 10 ** decimals))
}
