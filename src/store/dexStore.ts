import { createStore } from '@xstate/store'
import type { SnapshotFromStore } from '@xstate/store'
import { TOKENS } from '../utils/contracts'
import fiftyTwoFTokenSrc from '../assets/52F logo.png'

export interface Token {
  symbol: string
  name: string
  address: `0x${string}`
  decimals: number
  iconSrc?: string
  iconClass?: string
  isCustom?: boolean
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

// Preloaded in index.html via `<link rel="preload" as="image">`, so the
// browser fetches it during page load and serves all later <img> requests
// straight from cache — no flash of un-loaded icon when the swap form opens.
export const QF_TOKEN_ICON_SRC = 'https://coin-images.coingecko.com/coins/images/38823/large/qfnlogo.jpg?1729797482'

export const NATIVE_TOKEN: Token = {
  symbol: 'QF',
  name: 'QF Network',
  address: NATIVE_TOKEN_ADDRESS,
  decimals: 18,
  iconSrc: QF_TOKEN_ICON_SRC,
}

const INITIAL_TOKEN_LIST: Token[] = [
  NATIVE_TOKEN,
  { symbol: 'WQF',  name: 'Wrapped QF', address: TOKENS.WQF,  decimals: 18, iconSrc: QF_TOKEN_ICON_SRC },
  { symbol: 'QDPT', name: 'QDPT Token', address: TOKENS.QDPT, decimals: 18 },
  { symbol: '$52f', name: '$52f', address: TOKENS.$52F, decimals: 18, iconSrc: fiftyTwoFTokenSrc },
]

const CUSTOM_TOKEN_STORAGE_KEY = 'nucleusx:custom-tokens'

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

function normalizeAddress(address: string): string {
  return address.toLowerCase()
}

const WHITELISTED_TOKEN_ADDRESSES = new Set(
  INITIAL_TOKEN_LIST.map(token => normalizeAddress(token.address)),
)

export function isWhitelistedTokenAddress(address: string): boolean {
  return WHITELISTED_TOKEN_ADDRESSES.has(normalizeAddress(address))
}

function loadCustomTokens(): Token[] {
  const storage = getStorage()
  if (!storage) return []

  try {
    const raw = storage.getItem(CUSTOM_TOKEN_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed.flatMap((item) => {
      if (!item || typeof item !== 'object') return []

      const candidate = item as Partial<Token>
      if (
        typeof candidate.symbol !== 'string'
        || typeof candidate.name !== 'string'
        || typeof candidate.address !== 'string'
        || typeof candidate.decimals !== 'number'
      ) {
        return []
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(candidate.address)) return []
      if (isWhitelistedTokenAddress(candidate.address)) return []

      return [{
        symbol: candidate.symbol,
        name: candidate.name,
        address: candidate.address as `0x${string}`,
        decimals: candidate.decimals,
        iconSrc: candidate.iconSrc,
        iconClass: candidate.iconClass,
        isCustom: true,
      }]
    })
  }
  catch (err) {
    console.error('[dexStore] Failed to load custom tokens', err)
    return []
  }
}

function persistCustomTokens(tokens: Token[]): void {
  const storage = getStorage()
  if (!storage) return

  const customTokens = tokens.filter(token =>
    token.isCustom && !isWhitelistedTokenAddress(token.address),
  )

  storage.setItem(CUSTOM_TOKEN_STORAGE_KEY, JSON.stringify(customTokens))
}

function mergeTokenLists(base: Token[], custom: Token[]): Token[] {
  const merged = [...base]

  for (const token of custom) {
    const exists = merged.some(existing =>
      normalizeAddress(existing.address) === normalizeAddress(token.address),
    )
    if (!exists) merged.push({ ...token, isCustom: true })
  }

  return merged
}

const INITIAL_CONTEXT_TOKEN_LIST = mergeTokenLists(INITIAL_TOKEN_LIST, loadCustomTokens())

export const dexStore = createStore({
  context: {
    nativeToken: NATIVE_TOKEN as Token,
    tokenList: INITIAL_CONTEXT_TOKEN_LIST as Token[],
    balances: {} as Record<string, TokenBalance>,
    balancesVersion: 0,
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

    'balances.invalidate': ctx => ({
      ...ctx,
      balancesVersion: ctx.balancesVersion + 1,
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
      const nextTokenList = [...ctx.tokenList, { ...event.token, isCustom: event.token.isCustom ?? true }]
      persistCustomTokens(nextTokenList)
      return { ...ctx, tokenList: nextTokenList }
    },

    'tokenList.remove': (ctx, event: { tokenAddress: string }) => {
      if (isWhitelistedTokenAddress(event.tokenAddress)) return ctx

      const nextTokenList = ctx.tokenList.filter(token =>
        normalizeAddress(token.address) !== normalizeAddress(event.tokenAddress),
      )
      persistCustomTokens(nextTokenList)
      return { ...ctx, tokenList: nextTokenList }
    },
  },
})

type Snapshot = SnapshotFromStore<typeof dexStore>

export const selectTokenList    = (s: Snapshot): Token[]                        => s.context.tokenList
export const selectNativeToken  = (s: Snapshot): Token                          => s.context.nativeToken
export const selectBalances     = (s: Snapshot): Record<string, TokenBalance>   => s.context.balances
export const selectBalancesVersion = (s: Snapshot): number                      => s.context.balancesVersion
export const selectPairReserves = (s: Snapshot): Record<string, PairReserve>   => s.context.pairReserves
export const selectBlockNumber  = (s: Snapshot): number                         => s.context.blockNumber

export function selectTokenBalance(tokenAddress: string) {
  return (s: Snapshot): TokenBalance | undefined => s.context.balances[tokenAddress.toLowerCase()]
}
