import { useAtom } from '@xstate/store/react'
import { getSs58AddressInfo } from '@polkadot-api/substrate-bindings'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CONTRACTS, ERC20_ABI, ROUTER_ABI } from '../utils/contracts'
import { decodeContractResult, encodeContractCall } from '../utils/revive'
import { reviveCall, reviveEstimateGas, reviveTransaction } from '../utils/sdk-interface'
import { selectedAccount } from './useConnect'
import { swapSettings } from '../store/swapSettings'
import sdk from '../utils/sdk'
import { checkAccountMapping } from '../utils/revive'

export interface SwapQuote {
  amountOut: bigint
  amountOutFormatted: string
  amountOutMin: bigint
}

export interface UseSwapReturn {
  // State
  quote: SwapQuote | null
  isQuoting: boolean
  isApproving: boolean
  isSwapping: boolean
  txHash: string | null
  error: string | null
  evmAddress: `0x${string}` | undefined

  // Actions
  fetchQuote: (
    amountIn: bigint,
    tokenIn: `0x${string}`,
    tokenOut: `0x${string}`,
    outDecimals: number,
  ) => Promise<void>
  swap: (
    amountIn: bigint,
    tokenIn: `0x${string}`,
    tokenOut: `0x${string}`,
  ) => Promise<void>
  clearError: () => void
}

/**
 * Derive an EVM H160 address from a SS58 public key (last 20 bytes).
 * Used as a fallback when the chain mapping isn't yet registered.
 */
function pubkeyToH160(pubkey: Uint8Array): `0x${string}` {
  const h160 = pubkey.slice(12) // last 20 bytes of 32-byte key
  return `0x${Array.from(h160).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`
}

export function useSwap(): UseSwapReturn {
  const account = useAtom(selectedAccount)
  const settings = useAtom(swapSettings)

  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [isQuoting, setIsQuoting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [evmAddress, setEvmAddress] = useState<`0x${string}` | undefined>()

  const quoteAbortRef = useRef<AbortController | null>(null)

  // Resolve EVM address when account changes
  useEffect(() => {
    if (!account?.address) {
      setEvmAddress(undefined)
      return
    }

    async function resolveEvmAddress() {
      try {
        const { api } = sdk('qf_network')
        const mapping = await checkAccountMapping(api, account!.address)

        if (mapping.isMapped && mapping.evmAddress) {
          setEvmAddress(mapping.evmAddress as `0x${string}`)
        }
        else {
          // Fallback: derive deterministically from public key
          const info = getSs58AddressInfo(account!.address)
          if (info.isValid) {
            setEvmAddress(pubkeyToH160(info.publicKey))
          }
        }
      }
      catch {
        const info = getSs58AddressInfo(account!.address)
        if (info.isValid) {
          setEvmAddress(pubkeyToH160(info.publicKey))
        }
      }
    }

    resolveEvmAddress()
  }, [account?.address])

  const fetchQuote = useCallback(async (
    amountIn: bigint,
    tokenIn: `0x${string}`,
    tokenOut: `0x${string}`,
    outDecimals: number,
  ) => {
    if (amountIn === 0n) {
      setQuote(null)
      return
    }

    // Cancel any in-flight quote
    quoteAbortRef.current?.abort()
    quoteAbortRef.current = new AbortController()

    setIsQuoting(true)
    setError(null)

    try {
      const calldata = encodeContractCall(ROUTER_ABI, 'getAmountsOut', [amountIn, [tokenIn, tokenOut]])
      const result = await reviveCall('qf_network', {
        dest: CONTRACTS.UniswapV2Router02,
        value: 0n,
        calldata,
      })

      if (!result.result.ok) {
        throw new Error(result.result.err?.error ?? 'Quote failed')
      }

      const [amounts] = [decodeContractResult(ROUTER_ABI, 'getAmountsOut', result.result.ok.data as `0x${string}`)]
      const amountsArr = amounts as bigint[]
      const amountOut = amountsArr[amountsArr.length - 1]

      const slippageBps = Math.floor(Number.parseFloat(settings.slippage) * 100)
      const amountOutMin = amountOut * BigInt(10000 - slippageBps) / 10000n

      const amountOutFormatted = (Number(amountOut) / 10 ** outDecimals).toFixed(6)

      setQuote({ amountOut, amountOutFormatted, amountOutMin })
    }
    catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Quote failed')
      setQuote(null)
    }
    finally {
      setIsQuoting(false)
    }
  }, [settings.slippage])

  const swap = useCallback(async (
    amountIn: bigint,
    tokenIn: `0x${string}`,
    tokenOut: `0x${string}`,
  ) => {
    if (!account?.address) {
      setError('Connect your wallet first')
      return
    }
    if (!evmAddress) {
      setError('EVM address not resolved')
      return
    }
    if (!quote) {
      setError('No quote available')
      return
    }

    setError(null)
    setTxHash(null)

    try {
      // 1. Check allowance
      const allowanceCalldata = encodeContractCall(ERC20_ABI, 'allowance', [evmAddress, CONTRACTS.UniswapV2Router02])
      const allowanceRes = await reviveCall('qf_network', {
        dest: tokenIn,
        value: 0n,
        calldata: allowanceCalldata,
      })

      const currentAllowance = allowanceRes.result.ok
        ? BigInt(String(decodeContractResult(ERC20_ABI, 'allowance', allowanceRes.result.ok.data as `0x${string}`)))
        : 0n

      // 2. Approve if needed
      if (currentAllowance < amountIn) {
        setIsApproving(true)

        const approveCalldata = encodeContractCall(ERC20_ABI, 'approve', [CONTRACTS.UniswapV2Router02, amountIn])

        // Estimate gas for approve
        const approveGas = await reviveEstimateGas('qf_network', {
          dest: tokenIn,
          value: 0n,
          calldata: approveCalldata,
        }).catch(() => ({ gasRequired: 200_000n }))

        await new Promise<void>((resolve, reject) => {
          reviveTransaction('qf_network', {
            dest: tokenIn,
            value: 0n,
            gasLimit: approveGas.gasRequired,
            data: approveCalldata,
          }, {
            onFinalized: resolve,
            onError: (msg) => reject(new Error(msg)),
          })
        })

        setIsApproving(false)
      }

      // 3. Build swap calldata
      const deadline = BigInt(Math.floor(Date.now() / 1000) + Number.parseInt(settings.deadline) * 60)
      const swapCalldata = encodeContractCall(ROUTER_ABI, 'swapExactTokensForTokens', [
        amountIn,
        quote.amountOutMin,
        [tokenIn, tokenOut],
        evmAddress,
        deadline,
      ])

      // 4. Estimate gas
      const swapGas = await reviveEstimateGas('qf_network', {
        dest: CONTRACTS.UniswapV2Router02,
        value: 0n,
        calldata: swapCalldata,
      }).catch(() => ({ gasRequired: 500_000n }))

      // 5. Submit swap
      setIsSwapping(true)
      await new Promise<void>((resolve, reject) => {
        reviveTransaction('qf_network', {
          dest: CONTRACTS.UniswapV2Router02,
          value: 0n,
          gasLimit: swapGas.gasRequired,
          data: swapCalldata,
        }, {
          onTxHash: (hash) => setTxHash(hash),
          onFinalized: resolve,
          onError: (msg) => reject(new Error(msg)),
        })
      })
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Swap failed')
    }
    finally {
      setIsApproving(false)
      setIsSwapping(false)
    }
  }, [account?.address, evmAddress, quote, settings.deadline])

  return {
    quote,
    isQuoting,
    isApproving,
    isSwapping,
    txHash,
    error,
    evmAddress,
    fetchQuote,
    swap,
    clearError: () => setError(null),
  }
}
