import { useAtom } from '@xstate/store/react'
import { getSs58AddressInfo } from '@polkadot-api/substrate-bindings'
import { useMachine } from '@xstate/react'
import { useEffect, useRef } from 'react'
import { fromPromise } from 'xstate'
import { CONTRACTS, ERC20_ABI, FACTORY_ABI, PAIR_ABI, ROUTER_ABI, TOKENS } from '../utils/contracts'
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
import { toast } from '../store/toastStore'
import { dexStore, NATIVE_TOKEN_ADDRESS } from '../store/dexStore'
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

const DEFAULT_STORAGE_DEPOSIT_LIMIT = 1_000_000_000_000_000_000n
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

function isNativeQF(address: string): boolean {
  return address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
}

/**
 * Turn a raw router/pair revert into a user-facing message.
 * Most reverts on pallet-revive come back as opaque strings, so the best we
 * can do is catch common shapes and rewrite.
 */
function humanizeQuoteError(raw: unknown, tokenInSymbol: string, tokenOutSymbol: string): string {
  const msg = raw instanceof Error ? raw.message : String(raw ?? '')
  const lower = msg.toLowerCase()
  if (lower.includes('insufficient_liquidity') || lower.includes('insufficient liquidity'))
    return `Not enough liquidity in the ${tokenInSymbol}/${tokenOutSymbol} pool for this trade`
  if (lower.includes('insufficient_input_amount') || lower.includes('insufficient input amount'))
    return 'Input amount is too small to quote'
  if (lower.includes('invalid_path') || lower.includes('identical_addresses'))
    return 'Invalid token pair'
  // Router reverts when a pair has never been created — "Contract call failed
  // or returned no data" is what callContract surfaces for any revert.
  if (lower.includes('no data') || lower.includes('call failed') || lower.includes('execution reverted'))
    return `No liquidity pool exists for ${tokenInSymbol}/${tokenOutSymbol}`
  return msg || 'Could not fetch a quote'
}

function isWQF(address: string): boolean {
  return address.toLowerCase() === TOKENS.WQF.toLowerCase()
}

function isWrapPair(tokenIn: string, tokenOut: string): 'wrap' | 'unwrap' | null {
  if (isNativeQF(tokenIn) && isWQF(tokenOut)) return 'wrap'
  if (isWQF(tokenIn) && isNativeQF(tokenOut)) return 'unwrap'
  return null
}

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
          // QF ↔ WQF wraps/unwraps execute on the WQF contract at a fixed 1:1
          // rate, so skip the router quote entirely.
          if (isWrapPair(input.tokenIn.address, input.tokenOut.address)) {
            const amountOut = input.amountIn
            return {
              amountOut,
              amountOutMin: amountOut,
              amountOutFormatted: (Number(amountOut) / 10 ** input.tokenOut.decimals).toFixed(6),
            }
          }

          const slippage = settingsRef.current.slippage
          const { api } = sdk('qf_network')
          const origin = accountRef.current?.address ?? ''

          // Pre-check the pair exists so we can give a precise message instead
          // of the generic "Contract call failed" that the router emits when
          // getAmountsOut hits a non-existent pair.
          const pairCalldata = encodeContractCall(FACTORY_ABI, 'getPair', [
            input.tokenIn.address,
            input.tokenOut.address,
          ])
          const pairResult = await callContract(api, {
            origin,
            dest: CONTRACTS.UniswapV2Factory,
            value: 0n,
            calldata: pairCalldata,
          })
          if (signal.aborted) throw new Error('AbortError')

          const pairAddress = pairResult.result.ok
            ? String(decodeContractResult(FACTORY_ABI, 'getPair', pairResult.result.ok.data))
            : ZERO_ADDRESS
          if (!pairAddress || pairAddress.toLowerCase() === ZERO_ADDRESS) {
            throw new Error(
              `No liquidity pool exists for ${input.tokenIn.symbol}/${input.tokenOut.symbol}`,
            )
          }

          // Pair exists — confirm it actually has reserves before quoting.
          const reservesCalldata = encodeContractCall(PAIR_ABI, 'getReserves', [])
          const reservesResult = await callContract(api, {
            origin,
            dest: pairAddress,
            value: 0n,
            calldata: reservesCalldata,
          })
          if (signal.aborted) throw new Error('AbortError')
          if (reservesResult.result.ok) {
            const reserves = decodeContractResult(
              PAIR_ABI,
              'getReserves',
              reservesResult.result.ok.data,
            ) as readonly [bigint, bigint, number]
            if (reserves[0] === 0n || reserves[1] === 0n) {
              throw new Error(
                `${input.tokenIn.symbol}/${input.tokenOut.symbol} pool has no liquidity yet`,
              )
            }
          }

          const calldata = encodeContractCall(ROUTER_ABI, 'getAmountsOut', [
            input.amountIn,
            [input.tokenIn.address, input.tokenOut.address],
          ])
          const result = await callContract(api, {
            origin,
            dest: CONTRACTS.UniswapV2Router02,
            value: 0n,
            calldata,
          })

          if (signal.aborted) throw new Error('AbortError')
          if (!result.result.ok) {
            throw new Error(
              humanizeQuoteError(
                result.result.err?.error,
                input.tokenIn.symbol,
                input.tokenOut.symbol,
              ),
            )
          }

          const amounts = decodeContractResult(
            ROUTER_ABI,
            'getAmountsOut',
            result.result.ok.data,
          ) as bigint[]

          const amountOut = amounts[amounts.length - 1]
          if (amountOut === 0n) {
            throw new Error('Input amount is too small to quote — try a larger amount')
          }
          const slippageBps = Math.floor(Number.parseFloat(slippage) * 100)
          const amountOutMin = amountOut * BigInt(10000 - slippageBps) / 10000n
          const amountOutFormatted = (Number(amountOut) / 10 ** input.tokenOut.decimals).toFixed(6)

          return { amountOut, amountOutMin, amountOutFormatted }
        }),

        checkAllowance: fromPromise<CheckAllowanceActorOutput, CheckAllowanceActorInput>(
          async ({ input }) => {
            // QF↔WQF wraps/unwraps hit the WQF contract directly, no router
            // allowance required. Native QF also has no allowance to read.
            if (
              isWrapPair(input.tokenIn.address, input.tokenOut.address)
              || isNativeQF(input.tokenIn.address)
            ) {
              return { needsApproval: false }
            }

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
          }).catch(() => ({
            gasConsumed: { ref_time: 200_000n, proof_size: 10_000n },
            gasRequired: { ref_time: 200_000n, proof_size: 10_000n },
            storageDepositLimit: DEFAULT_STORAGE_DEPOSIT_LIMIT,
          }))

          const gasLimit = {
            ref_time: (gas.gasRequired.ref_time * 125n) / 100n,
            proof_size: (gas.gasRequired.proof_size * 125n) / 100n,
          }

          toast.info(`Approving ${input.tokenIn.symbol}`, 'Confirm in your wallet')

          await new Promise<void>((resolve, reject) => {
            reviveTransaction(
              'qf_network',
              {
                dest: input.tokenIn.address,
                value: 0n,
                gasLimit,
                storageDepositLimit: gas.storageDepositLimit,
                data: calldata,
              },
              {
                onTxHash: (hash) => {
                  toast.info(`${input.tokenIn.symbol} approval submitted`, hash)
                },
                onFinalized: resolve,
                onError: (msg) => reject(new Error(msg)),
              },
            ).catch(reject)
          })

          toast.success(`${input.tokenIn.symbol} approved`)
        }),

        executeSwap: fromPromise<SwapActorOutput, SwapActorInput>(async ({ input }) => {
          // QF ↔ WQF: bypass the router and call WQF.deposit() / WQF.withdraw()
          // directly at a fixed 1:1 rate. The router path would fail because the
          // router's WETH() is WQF, so pairing QF↔WQF through it is degenerate.
          const wrapKind = isWrapPair(input.tokenIn.address, input.tokenOut.address)
          if (wrapKind) {
            const calldata = wrapKind === 'wrap'
              ? encodeContractCall(ERC20_ABI, 'deposit', [])
              : encodeContractCall(ERC20_ABI, 'withdraw', [input.amountIn])
            const value = wrapKind === 'wrap' ? input.amountIn : 0n
            const gas = await reviveEstimateGas('qf_network', {
              dest: TOKENS.WQF,
              value,
              calldata,
            }).catch(() => ({
              gasConsumed: { ref_time: 500_000n, proof_size: 10_000n },
              gasRequired: { ref_time: 500_000n, proof_size: 10_000n },
              storageDepositLimit: DEFAULT_STORAGE_DEPOSIT_LIMIT,
            }))

            const gasLimit = {
              ref_time: (gas.gasRequired.ref_time * 125n) / 100n,
              proof_size: (gas.gasRequired.proof_size * 125n) / 100n,
            }

            toast.info(
              wrapKind === 'wrap' ? 'Wrapping QF' : 'Unwrapping WQF',
              'Confirm in your wallet',
            )

            return new Promise<SwapActorOutput>((resolve, reject) => {
              let capturedHash = ''
              reviveTransaction(
                'qf_network',
                {
                  dest: TOKENS.WQF,
                  value,
                  gasLimit,
                  storageDepositLimit: gas.storageDepositLimit,
                  data: calldata,
                },
                {
                  onTxHash: (hash) => {
                    capturedHash = hash
                    toast.info(
                      wrapKind === 'wrap' ? 'Wrap submitted' : 'Unwrap submitted',
                      hash,
                    )
                  },
                  onFinalized: () => {
                    dexStore.send({ type: 'balances.invalidate' })
                    toast.success(
                      wrapKind === 'wrap' ? 'Wrap confirmed' : 'Unwrap confirmed',
                      capturedHash || undefined,
                    )
                    resolve({ txHash: capturedHash })
                  },
                  onError: (msg) => reject(new Error(msg)),
                },
              ).catch(reject)
            })
          }

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
          }).catch(() => ({
            gasConsumed: { ref_time: 500_000n, proof_size: 10_000n },
            gasRequired: { ref_time: 500_000n, proof_size: 10_000n },
            storageDepositLimit: DEFAULT_STORAGE_DEPOSIT_LIMIT,
          }))

          const gasLimit = {
            ref_time: (gas.gasRequired.ref_time * 125n) / 100n,
            proof_size: (gas.gasRequired.proof_size * 125n) / 100n,
          }

          toast.info('Swapping tokens', 'Confirm in your wallet')

          return new Promise<SwapActorOutput>((resolve, reject) => {
            let capturedHash = ''
            reviveTransaction(
              'qf_network',
              {
                dest: CONTRACTS.UniswapV2Router02,
                value: 0n,
                gasLimit,
                storageDepositLimit: gas.storageDepositLimit,
                data: calldata,
              },
              {
                onTxHash: (hash) => {
                  capturedHash = hash
                  toast.info('Swap submitted', hash)
                },
                onFinalized: () => {
                  dexStore.send({ type: 'balances.invalidate' })
                  toast.success('Swap confirmed', capturedHash || undefined)
                  resolve({ txHash: capturedHash })
                },
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

  // Surface machine-level errors (actor rejections) as toasts so failures outside
  // the approve/swap actors themselves still reach the user. The title varies
  // by where the error originated: quote failures return to 'idle', so those
  // appear as "Quote unavailable"; approve/swap failures land in 'error'.
  const lastErrorRef = useRef<string | null>(null)
  useEffect(() => {
    if (ctx.error && ctx.error !== lastErrorRef.current) {
      lastErrorRef.current = ctx.error
      const title = state === 'error' ? 'Swap failed' : 'Quote unavailable'
      toast.error(title, ctx.error)
    }
    else if (!ctx.error) {
      lastErrorRef.current = null
    }
  }, [ctx.error, state])

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
