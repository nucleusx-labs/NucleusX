import type { Abi, ContractFunctionArgs, ContractFunctionName } from 'viem'
import type { PolkadotSigner, TypedApi } from 'polkadot-api'
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
  result: {
    ok?: {
      flags: number
      data: string
    }
    err?: {
      revert?: string
      error?: string
    }
  }
  gasConsumed: bigint
  gasRequired: bigint
  storageDeposit: {
    ok?: bigint
    err?: string
  }
  debugMessage: string
}

export interface ReviveTransactionOptions {
  dest: string // Contract address
  value: bigint // Value to transfer
  gasLimit: bigint
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

  // Call the ReviveApi runtime API
  const result = await (api.apis.ReviveApi.call as any)(
    origin,
    dest,
    value,
    undefined, // gasLimit - let the runtime estimate
    undefined, // storageDepositLimit
    calldata,
  )

  return result as ReviveCallResult
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

  // Build the revivive.call extrinsic
  const tx = (api.tx.Revive.call as any)({
    dest,
    value,
    gas_limit: gasLimit,
    storage_deposit_limit: storageDepositLimit,
    data,
  })

  // Sign and submit
  const unsub = tx.signAndSubmit(signer).subscribe({
    next: (event: any) => {
      switch (event.type) {
        case 'txBestBlocksState':
          if (event.found) {
            callbacks.onTxHash?.(event.txHash)
          }
          break
        case 'finalized':
          callbacks.onFinalized()
          unsub.unsubscribe()
          break
      }
    },
    error: (err: any) => {
      console.error('Transaction error:', err)
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
): Promise<{ gasConsumed: bigint, gasRequired: bigint }> {
  const result = await callContract(api, options)

  return {
    gasConsumed: result.gasConsumed,
    gasRequired: result.gasRequired,
  }
}

/**
 * Check if an account needs to be mapped (SS58 -> EVM)
 * This is typically done automatically by the wallet on first transaction
 */
export async function checkAccountMapping(
  api: TypedApi<any>,
  address: string,
): Promise<{ isMapped: boolean, evmAddress?: string }> {
  try {
    // Query the account mapping from the Revive pallet
    const accountsQuery = api.query.Revive.Accounts as any
    const accountInfo = await accountsQuery.getValue(address)

    if (accountInfo) {
      return {
        isMapped: true,
        evmAddress: accountInfo.evm_address,
      }
    }

    return { isMapped: false }
  }
  catch {
    // If query fails, account likely doesn't exist yet
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
