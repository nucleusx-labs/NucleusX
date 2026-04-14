import { useState, useCallback } from 'react'
import type { Prefix } from '../utils/sdk'
import type {
  ReviveCallOptions,
  ReviveCallResult,
  ReviveTransactionOptions,
  TransactionCallbacks,
} from '../utils/revive'
import sdk from '../utils/sdk'
import {
  callContract,
  submitContractTransaction,
  estimateGas,
  checkAccountMapping,
} from '../utils/revive'

export interface UseReviveApiReturn {
  // State
  isCalling: boolean
  isProcessing: boolean
  callResult: ReviveCallResult | null
  error: string | null
  txHash: string | null

  // Read operations
  callContract: (chainPrefix: Prefix, options: ReviveCallOptions) => Promise<ReviveCallResult>

  // Write operations
  submitTransaction: (
    chainPrefix: Prefix,
    options: Omit<ReviveTransactionOptions, 'signer'>,
    callbacks?: Partial<TransactionCallbacks>,
  ) => Promise<void>

  // Utilities
  estimateGas: (chainPrefix: Prefix, options: ReviveCallOptions) => Promise<{ gasConsumed: { ref_time: bigint; proof_size: bigint }, gasRequired: { ref_time: bigint; proof_size: bigint } }>
  checkAccountMapping: (chainPrefix: Prefix, address: string) => Promise<{ isMapped: boolean, evmAddress?: string }>
}

export function useReviveApi(): UseReviveApiReturn {
  const [isCalling, setIsCalling] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [callResult, setCallResult] = useState<ReviveCallResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)

  /**
   * Perform a read-only contract call
   */
  const callContractFn = useCallback(async (
    chainPrefix: Prefix,
    options: ReviveCallOptions,
  ): Promise<ReviveCallResult> => {
    setIsCalling(true)
    setError(null)

    try {
      const { api } = sdk(chainPrefix)
      const result = await callContract(api, options)
      setCallResult(result)
      return result
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Contract call failed'
      setError(errorMessage)
      throw err
    }
    finally {
      setIsCalling(false)
    }
  }, [])

  /**
   * Submit a state-changing transaction
   */
  const submitTransactionFn = useCallback(async (
    chainPrefix: Prefix,
    options: Omit<ReviveTransactionOptions, 'signer'>,
    callbacks?: Partial<TransactionCallbacks>,
  ): Promise<void> => {
    const fullOptions = options as ReviveTransactionOptions
    if (!fullOptions.signer) {
      setError('No signer provided')
      throw new Error('No signer provided')
    }

    setIsProcessing(true)
    setError(null)
    setTxHash(null)

    try {
      const { api } = sdk(chainPrefix)

      // Default callbacks
      const defaultCallbacks: TransactionCallbacks = {
        onTxHash: (hash) => {
          setTxHash(hash)
          callbacks?.onTxHash?.(hash)
        },
        onFinalized: () => {
          setIsProcessing(false)
          callbacks?.onFinalized?.()
        },
        onError: (err) => {
          setIsProcessing(false)
          setError(err)
          callbacks?.onError?.(err)
        },
        onBroadcast: () => {
          callbacks?.onBroadcast?.()
        },
      }

      await submitContractTransaction(api, options as ReviveTransactionOptions, defaultCallbacks)
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed'
      setError(errorMessage)
      setIsProcessing(false)
      throw err
    }
  }, [])

  /**
   * Estimate gas for a contract call
   */
  const estimateGasFn = useCallback(async (
    chainPrefix: Prefix,
    options: ReviveCallOptions,
  ): Promise<{ gasConsumed: { ref_time: bigint; proof_size: bigint }, gasRequired: { ref_time: bigint; proof_size: bigint } }> => {
    const { api } = sdk(chainPrefix)
    return await estimateGas(api, options)
  }, [])

  /**
   * Check if an account is mapped (SS58 -> EVM)
   */
  const checkAccountMappingFn = useCallback(async (
    chainPrefix: Prefix,
    address: string,
  ): Promise<{ isMapped: boolean, evmAddress?: string }> => {
    const { api } = sdk(chainPrefix)
    return await checkAccountMapping(api, address)
  }, [])

  return {
    // State
    isCalling,
    isProcessing,
    callResult,
    error,
    txHash,

    // Methods
    callContract: callContractFn,
    submitTransaction: submitTransactionFn,
    estimateGas: estimateGasFn,
    checkAccountMapping: checkAccountMappingFn,
  }
}
