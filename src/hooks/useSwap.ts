import { useAtom } from '@xstate/store/react'
import { getSs58AddressInfo } from '@polkadot-api/substrate-bindings'
import { useMachine } from '@xstate/react'
import { useEffect, useRef } from 'react'
import { fromPromise } from 'xstate'
import { CONTRACTS, ERC20_ABI, ROUTER_ABI } from '../utils/contracts'
import {
  callContract,
  checkAccountMapping,
  decodeContractResult,
  encodeContractCall,
} from '../utils/revive'
import { reviveEstimateGas, reviveTransaction } from '../utils/sdk-interface'
import { selectedAccount } from './useConnect'
import { swapSettings } from '../store/swapSettings'
import { swapMachine } from '../store/swapMachine'
import type {
  ApproveActorInput,
  CheckAllowanceActorInput,
  CheckAllowanceActorOutput,
  QuoteActorInput,
  SwapActorInput,
  SwapActorOutput,
  SwapQuote,
} from '../store/swapMachine'
import type { Token } from '../store/dexStore'
import sdk from '../utils/sdk'

function pubkeyToH160(pubkey: Uint8Array): `0x${string}` {
  const h160 = pubkey.slice(12)
  return `0x${Array.from(h160).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`
}

export interface UseSwapReturn {
  quote: SwapQuote | null
  isQuoting: boolean
  isCheckingAllowance: boolean
  isApproving: boolean
  isSwapping: boolean
  isSuccess: boolean
  txHash: string | null
  error: string | null
  evmAddress: `0x${string}` | undefined
  fetchQuote: (amountIn: bigint, tokenIn: Token, tokenOut: Token) => void
  swap: () => void
  clearError: () => void
  reset: () => void
}

export function useSwap(): UseSwapReturn {
  const account = useAtom(selectedAccount)
  const settings = useAtom(swapSettings)

  // Keep refs to avoid stale closures in actor implementations
  const settingsRef = useRef(settings)
  settingsRef.current = settings
  const accountRef = useRef(account)
  accountRef.current = account

  const [snapshot, send] = useMachine(
    swapMachine.provide({
      actors: {
        fetchQuote: fromPromise<SwapQuote, QuoteActorInput>(async ({ input, signal }) => {
          const slippage = settingsRef.current.slippage
          const calldata = encodeContractCall(ROUTER_ABI, 'getAmountsOut', [
            input.amountIn,
            [input.tokenIn.address, input.tokenOut.address],
          ])
          const { api } = sdk('qf_network')
          const result = await callContract(api, {
            origin: accountRef.current?.address ?? '',
            dest: CONTRACTS.UniswapV2Router02,
            value: 0n,
            calldata,
          })

          if (signal.aborted) throw new Error('AbortError')
          if (!result.result.ok) {
            throw new Error(result.result.err?.error ?? 'Quote failed')
          }

          const amounts = decodeContractResult(
            ROUTER_ABI,
            'getAmountsOut',
            result.result.ok.data,
          ) as bigint[]

          const amountOut = amounts[amounts.length - 1]
          const slippageBps = Math.floor(Number.parseFloat(slippage) * 100)
          const amountOutMin = amountOut * BigInt(10000 - slippageBps) / 10000n
          const amountOutFormatted = (Number(amountOut) / 10 ** input.tokenOut.decimals).toFixed(6)

          return { amountOut, amountOutMin, amountOutFormatted }
        }),

        checkAllowance: fromPromise<CheckAllowanceActorOutput, CheckAllowanceActorInput>(
          async ({ input }) => {
            const calldata = encodeContractCall(ERC20_ABI, 'allowance', [
              input.evmAddress,
              CONTRACTS.UniswapV2Router02,
            ])
            const { api } = sdk('qf_network')
            const result = await callContract(api, {
              origin: accountRef.current?.address ?? '',
              dest: input.tokenIn.address,
              value: 0n,
              calldata,
            })

            const currentAllowance = result.result.ok
              ? BigInt(String(decodeContractResult(ERC20_ABI, 'allowance', result.result.ok.data)))
              : 0n

            return { needsApproval: currentAllowance < input.amountIn }
          },
        ),

        approveToken: fromPromise<void, ApproveActorInput>(async ({ input }) => {
          const calldata = encodeContractCall(ERC20_ABI, 'approve', [
            CONTRACTS.UniswapV2Router02,
            input.amountIn,
          ])
          const gas = await reviveEstimateGas('qf_network', {
            dest: input.tokenIn.address,
            value: 0n,
            calldata,
          }).catch(() => ({ gasRequired: 200_000n }))

          await new Promise<void>((resolve, reject) => {
            reviveTransaction(
              'qf_network',
              { dest: input.tokenIn.address, value: 0n, gasLimit: gas.gasRequired, data: calldata },
              { onFinalized: resolve, onError: (msg) => reject(new Error(msg)) },
            ).catch(reject)
          })
        }),

        executeSwap: fromPromise<SwapActorOutput, SwapActorInput>(async ({ input }) => {
          const deadline = BigInt(
            Math.floor(Date.now() / 1000) + Number.parseInt(settingsRef.current.deadline) * 60,
          )
          const calldata = encodeContractCall(ROUTER_ABI, 'swapExactTokensForTokens', [
            input.amountIn,
            input.amountOutMin,
            [input.tokenIn.address, input.tokenOut.address],
            input.evmAddress,
            deadline,
          ])
          const gas = await reviveEstimateGas('qf_network', {
            dest: CONTRACTS.UniswapV2Router02,
            value: 0n,
            calldata,
          }).catch(() => ({ gasRequired: 500_000n }))

          return new Promise<SwapActorOutput>((resolve, reject) => {
            reviveTransaction(
              'qf_network',
              {
                dest: CONTRACTS.UniswapV2Router02,
                value: 0n,
                gasLimit: gas.gasRequired,
                data: calldata,
              },
              {
                onTxHash: (hash) => resolve({ txHash: hash }),
                onFinalized: () => {},
                onError: (msg) => reject(new Error(msg)),
              },
            ).catch(reject)
          })
        }),
      },
    }),
  )

  // Resolve EVM address whenever the connected account changes
  useEffect(() => {
    if (!account?.address) return

    async function resolveEvmAddress() {
      try {
        const { api } = sdk('qf_network')
        const mapping = await checkAccountMapping(api, account!.address)

        if (mapping.isMapped && mapping.evmAddress) {
          send({ type: 'SET_EVM_ADDRESS', evmAddress: mapping.evmAddress as `0x${string}` })
        }
        else {
          const info = getSs58AddressInfo(account!.address)
          if (info.isValid) {
            send({ type: 'SET_EVM_ADDRESS', evmAddress: pubkeyToH160(info.publicKey) })
          }
        }
      }
      catch {
        const info = getSs58AddressInfo(account!.address)
        if (info.isValid) {
          send({ type: 'SET_EVM_ADDRESS', evmAddress: pubkeyToH160(info.publicKey) })
        }
      }
    }

    resolveEvmAddress()
  }, [account?.address])

  const ctx = snapshot.context
  const state = snapshot.value as string

  return {
    quote: ctx.quote,
    isQuoting: state === 'quoting',
    isCheckingAllowance: state === 'checkingAllowance',
    isApproving: state === 'approving',
    isSwapping: state === 'swapping',
    isSuccess: state === 'success',
    txHash: ctx.txHash,
    error: ctx.error,
    evmAddress: ctx.evmAddress ?? undefined,

    fetchQuote: (amountIn: bigint, tokenIn: Token, tokenOut: Token) => {
      send({ type: 'QUOTE', tokenIn, tokenOut, amountIn })
    },

    swap: () => {
      send({ type: 'APPROVE_AND_SWAP' })
    },

    clearError: () => send({ type: 'CLEAR_ERROR' }),
    reset: () => send({ type: 'RESET' }),
  }
}
