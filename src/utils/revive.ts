import type { Abi, ContractFunctionArgs, ContractFunctionName } from 'viem'
import type { PolkadotSigner, TypedApi } from 'polkadot-api'
import { Binary, FixedSizeBinary } from 'polkadot-api'
import { decodeFunctionResult, encodeFunctionData } from 'viem'
import { isRetryableSigningError } from './sign-retry'

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

export interface GasMetrics {
  ref_time: bigint
  proof_size: bigint
}

export interface ReviveCallResult {
  result:
    | { ok: { flags: number; data: `0x${string}` }; err?: never }
    | { ok?: never; err: { error: string } }
  gas_consumed: GasMetrics
  gas_required?: Partial<GasMetrics> | null
  storage_deposit: unknown
  debug_message: unknown
}

export interface ReviveTransactionOptions {
  dest: string // Contract address
  value: bigint // Value to transfer
  gasLimit: GasMetrics
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

export interface EstimatedCallResources {
  gasConsumed: GasMetrics
  gasRequired: GasMetrics
  storageDepositLimit: bigint
}

function toBigIntOrUndefined(value: unknown): bigint | undefined {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number' && Number.isFinite(value)) return BigInt(value)
  if (typeof value === 'string' && value.length > 0) {
    try {
      return BigInt(value)
    }
    catch {
      return undefined
    }
  }
  return undefined
}

function normalizeGasMetrics(value: unknown, fallback: GasMetrics): GasMetrics {
  const metrics = value as { ref_time?: unknown; proof_size?: unknown } | null | undefined
  return {
    ref_time: toBigIntOrUndefined(metrics?.ref_time) ?? fallback.ref_time,
    proof_size: toBigIntOrUndefined(metrics?.proof_size) ?? fallback.proof_size,
  }
}

function normalizeStorageDepositLimit(storageDeposit: unknown): bigint {
  if (!storageDeposit || typeof storageDeposit !== 'object') return 0n

  const deposit = storageDeposit as { type?: unknown; value?: unknown }
  if (deposit.type !== undefined && deposit.type !== 'Charge') return 0n

  const reported = toBigIntOrUndefined(deposit.value) ?? 0n
  return reported > 0n ? (reported * 125n) / 100n : 0n
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
  const explicitStorageDepositLimit = storageDepositLimit ?? 0n

  const destHex = dest.startsWith('0x') ? dest.slice(2) : dest
  const destFixed = FixedSizeBinary.fromArray(
    destHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)),
  )
  const inputData = Binary.fromHex(data)

  console.log('[Revive] Submitting tx', {
    dest,
    value,
    gas_limit: gasLimit,
    storage_deposit_limit: explicitStorageDepositLimit,
    data,
  })

  // Build the revive.call extrinsic fresh on each attempt — retries need a
  // new nonce, block hash, and metadata snapshot, which PAPI handles when
  // `.signSubmitAndWatch(...)` is re-invoked on a freshly built tx.
  const buildTx = () => (api.tx.Revive.call as any)({
    dest: destFixed,
    value,
    gas_limit: gasLimit,
    storage_deposit_limit: explicitStorageDepositLimit,
    data: inputData,
  })

  const maxAttempts = 2
  let attempt = 0
  let activeUnsub: (() => void) | null = null
  let cancelled = false
  let settled = false
  let watchdog: ReturnType<typeof setTimeout> | null = null

  // Some wallets (notably Talisman) can confirm or reject without the PAPI
  // subscription ever emitting another event. Without a watchdog the swap UI
  // would hang indefinitely; 120s is longer than a healthy finalization but
  // short enough that users aren't left guessing.
  const WATCHDOG_MS = 120_000

  const cleanup = () => {
    if (watchdog) {
      clearTimeout(watchdog)
      watchdog = null
    }
    activeUnsub?.()
    activeUnsub = null
  }

  const settle = (fn: () => void) => {
    if (settled) return
    settled = true
    cleanup()
    fn()
  }

  const tryOnce = () => {
    attempt++
    const sub = buildTx().signSubmitAndWatch(signer).subscribe({
      next: (event: any) => {
        if (settled) return
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
              settle(() => callbacks.onError('Transaction failed on-chain'))
            }
            else {
              console.log('[Revive] tx finalized ok, hash:', event.txHash)
              settle(() => callbacks.onFinalized())
            }
            break
        }
      },
      error: (err: any) => {
        sub.unsubscribe()
        activeUnsub = null
        if (cancelled || settled) return
        if (attempt < maxAttempts && isRetryableSigningError(err)) {
          console.warn(
            `[papi] transient signing failure on attempt ${attempt}/${maxAttempts}; retrying with a fresh payload`,
            err,
          )
          tryOnce()
          return
        }
        console.error('[Revive] tx subscription error:', err)
        settle(() => callbacks.onError(err instanceof Error ? err.message : 'Unknown error'))
      },
    })
    activeUnsub = () => sub.unsubscribe()
  }

  tryOnce()

  watchdog = setTimeout(() => {
    if (settled) return
    console.warn(`[Revive] tx watchdog fired after ${WATCHDOG_MS}ms — no terminal event received`)
    settle(() =>
      callbacks.onError(
        'Transaction timed out. Please check your wallet and block explorer before retrying.',
      ),
    )
  }, WATCHDOG_MS)

  return () => {
    cancelled = true
    cleanup()
  }
}

/**
 * Perform a dry-run to estimate gas consumption
 */
export async function estimateGas(
  api: TypedApi<any>,
  options: ReviveCallOptions,
): Promise<EstimatedCallResources> {
  const result = await callContract(api, options)
  const gasConsumed = normalizeGasMetrics(result.gas_consumed, {
    ref_time: 500_000n,
    proof_size: 10_000n,
  })
  const gasRequired = normalizeGasMetrics(result.gas_required, gasConsumed)
  const storageDepositLimit = normalizeStorageDepositLimit(result.storage_deposit)

  console.log('[Revive] gas estimate', {
    dest: options.dest,
    consumed: gasConsumed,
    required: gasRequired,
    storageDeposit: result.storage_deposit,
    result: result.result,
  })

  return {
    gasConsumed,
    gasRequired,
    storageDepositLimit,
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
