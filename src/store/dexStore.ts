import { createStore } from '@xstate/store'
import type { SnapshotFromStore } from '@xstate/store'
import { CONTRACTS } from '../utils/contracts'

export interface Token {
  symbol: string
  name: string
  address: `0x${string}`
  decimals: number
  iconClass?: string
}

export interface TokenBalance {
  balance: bigint
  decimals: number
  formatted: string
}

export interface PairReserve {
  reserve0: bigint
  reserve1: bigint
  token0: `0x${string}`
  token1: `0x${string}`
  blockTimestampLast: number
}

export const NATIVE_TOKEN_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE' as const satisfies `0x${string}`

export const NATIVE_TOKEN: Token = {
  symbol: 'QF',
  name: 'QF Network',
  address: NATIVE_TOKEN_ADDRESS,
  decimals: 18,
}

const INITIAL_TOKEN_LIST: Token[] = [
  {
    symbol: 'WQF',
    name: 'Wrapped QF',
    address: CONTRACTS.WQF,
    decimals: 18,
  },
]

export const dexStore = createStore({
  context: {
    nativeToken: NATIVE_TOKEN as Token,
    tokenList: INITIAL_TOKEN_LIST as Token[],
    balances: {} as Record<string, TokenBalance>,
    pairReserves: {} as Record<string, PairReserve>,
    blockNumber: 0,
  },
  on: {
    'block.update': (ctx, event: { blockNumber: number }) => ({
      ...ctx,
      blockNumber: event.blockNumber,
    }),

    'balances.set': (ctx, event: { balances: Record<string, TokenBalance> }) => ({
      ...ctx,
      balances: event.balances,
    }),

    'balance.update': (ctx, event: { tokenAddress: string; balance: TokenBalance }) => ({
      ...ctx,
      balances: {
        ...ctx.balances,
        [event.tokenAddress.toLowerCase()]: event.balance,
      },
    }),

    'pairReserves.set': (ctx, event: { pairAddress: string; reserves: PairReserve }) => ({
      ...ctx,
      pairReserves: {
        ...ctx.pairReserves,
        [event.pairAddress.toLowerCase()]: event.reserves,
      },
    }),

    'pairReserves.invalidate': (ctx, event: { pairAddress: string }) => {
      const next = { ...ctx.pairReserves }
      delete next[event.pairAddress.toLowerCase()]
      return { ...ctx, pairReserves: next }
    },

    'tokenList.add': (ctx, event: { token: Token }) => {
      const already = ctx.tokenList.some(
        t => t.address.toLowerCase() === event.token.address.toLowerCase(),
      )
      if (already) return ctx
      return { ...ctx, tokenList: [...ctx.tokenList, event.token] }
    },
  },
})

type Snapshot = SnapshotFromStore<typeof dexStore>

export const selectTokenList    = (s: Snapshot): Token[]                        => s.context.tokenList
export const selectNativeToken  = (s: Snapshot): Token                          => s.context.nativeToken
export const selectBalances     = (s: Snapshot): Record<string, TokenBalance>   => s.context.balances
export const selectPairReserves = (s: Snapshot): Record<string, PairReserve>   => s.context.pairReserves
export const selectBlockNumber  = (s: Snapshot): number                         => s.context.blockNumber

export function selectTokenBalance(tokenAddress: string) {
  return (s: Snapshot): TokenBalance | undefined => s.context.balances[tokenAddress.toLowerCase()]
}
