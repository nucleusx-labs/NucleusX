import { useAtom, useSelector } from '@xstate/store/react'
import { AlertTriangle, ArrowUpRight, History, Minus, Plus, Target, Wallet, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TokenIcon from '../components/TokenIcon'
import { selectedAccount } from '../hooks/useConnect'
import { useTokenBalances } from '../hooks/useTokenBalances'
import { dexStore, selectTokenList } from '../store/dexStore'
import { checkAccountMapping } from '../utils/revive'
import sdk from '../utils/sdk'
import { getBalance } from '../utils/sdk-interface'

const TOKEN_COLORS = ['bg-ncx-purple-500', 'bg-ncx-gain', 'bg-ncx-warn', 'bg-ncx-info']

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-ncx-wash-strong rounded-md ${className ?? ''}`} />
}

export default function UserDashboard() {
  const account = useAtom(selectedAccount)
  const tokenList = useSelector(dexStore, selectTokenList)

  const [evmAddress, setEvmAddress] = useState<`0x${string}` | undefined>()
  const [evmLoading, setEvmLoading] = useState(false)
  const [evmMapped, setEvmMapped] = useState<boolean | null>(null) // null = unknown
  const [nativeBalance, setNativeBalance] = useState<{ balance: string, symbol: string } | null>(null)
  const [nativeLoading, setNativeLoading] = useState(false)

  // Resolve EVM address from on-chain mapping (set via revive.mapAccount extrinsic)
  useEffect(() => {
    if (!account?.address) {
      setEvmAddress(undefined)
      setEvmMapped(null)
      return
    }

    let cancelled = false
    setEvmAddress(undefined)
    setEvmLoading(true)
    setEvmMapped(null)

    async function resolveEvmAddress() {
      try {
        const { api } = sdk('qf_network')
        const mapping = await checkAccountMapping(api, account!.address)
        console.log("ping")
        if (cancelled) return
        if (mapping.isMapped && mapping.evmAddress) {
          setEvmAddress(mapping.evmAddress as `0x${string}`)
          setEvmMapped(true)
        }
        else {
          setEvmAddress(undefined)
          setEvmMapped(false)
        }
      }
      catch {
        if (!cancelled) {
          setEvmAddress(undefined)
          setEvmMapped(false)
        }
      }
      finally {
        if (!cancelled) setEvmLoading(false)
      }
    }

    resolveEvmAddress()
    return () => { cancelled = true }
  }, [account?.address])

  // Fetch native balance
  useEffect(() => {
    if (!account?.address) {
      setNativeBalance(null)
      return
    }

    let cancelled = false
    setNativeLoading(true)

    getBalance('qf_network', account.address)
      .then(({ balance, symbol }) => {
        console.log("pong")
        if (!cancelled) setNativeBalance({ balance, symbol })
      })
      .catch(() => {
        if (!cancelled) setNativeBalance(null)
      })
      .finally(() => {
        if (!cancelled) setNativeLoading(false)
      })

    return () => { cancelled = true }
  }, [account?.address])

  // ERC20 balances
  const erc20Balances = useTokenBalances(
    evmAddress,
    tokenList.map(t => t.address),
    account?.address,
  )

  console.log({erc20Balances})

  // Build asset rows: native first, then ERC20 tokens with non-zero or all
  const nativeSymbol = nativeBalance?.symbol ?? 'QF'
  const nativeFormatted = nativeBalance?.balance ?? null
  const nativeToken = tokenList.find(token => token.symbol === nativeSymbol)

  const erc20Rows = tokenList.map((token, i) => ({
    ...token,
    formatted: erc20Balances.get(token.address.toLowerCase())?.formatted ?? null,
    colorClass: TOKEN_COLORS[(i + 1) % TOKEN_COLORS.length],
  }))

  // Count tokens with known balances for allocation bar
  const allTokens = [
    { symbol: nativeSymbol, colorClass: TOKEN_COLORS[0], hasBalance: !!nativeFormatted },
    ...erc20Rows.map(t => ({ symbol: t.symbol, colorClass: t.colorClass, hasBalance: !!t.formatted })),
  ]
  const tokenCount = allTokens.length
  const segmentPct = tokenCount > 0 ? (100 / tokenCount) : 0

  // --- Empty state ---
  if (!account) {
    return (
      <div className="max-w-7xl mx-auto w-full py-6 sm:py-10">
        <header>
          <p className="ncx-num text-[10px] uppercase tracking-[0.22em] text-ncx-purple-300 mb-3">Overview</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ncx-text">Portfolio</h1>
        </header>
        <div className="mt-20 flex flex-col items-center gap-5 text-center">
          <div
            className="w-16 h-16 rounded-full grid place-items-center"
            style={{ background: 'var(--ncx-wash)', border: '1px solid color-mix(in srgb, var(--ncx-purple-500) 25%, transparent)' }}
          >
            <Wallet className="w-7 h-7 text-ncx-purple-300" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-ncx-text">No wallet connected</h2>
          <p className="text-sm text-ncx-text-muted max-w-xs">
            Connect a Substrate wallet using the button in the header to view your portfolio.
          </p>
        </div>
      </div>
    )
  }

  // Sparkline path (deterministic gentle wave) — placeholder until real series wires in
  const chartPath = useMemo(() => {
    const W = 600
    const H = 180
    const seed = (account?.address?.length ?? 8) + (nativeFormatted?.length ?? 0)
    const rand = (i: number) => {
      const v = Math.sin((seed + i) * 12.9898) * 43758.5453
      return v - Math.floor(v)
    }
    const points: Array<[number, number]> = []
    const N = 40
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * W
      const trend = (1 - i / N) * 0.55 + 0.15
      const noise = rand(i) * 0.25
      const y = (trend + noise) * H
      points.push([x, y])
    }
    const line = points.map(([x, y], i) => (i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `L ${x.toFixed(1)} ${y.toFixed(1)}`)).join(' ')
    const area = `${line} L ${W} ${H} L 0 ${H} Z`
    const last = points[points.length - 1]
    return { line, area, lastX: last[0], lastY: last[1] }
  }, [account?.address, nativeFormatted])

  const totalBalance = nativeFormatted ? parseFloat(nativeFormatted) : 0

  return (
    <div className="max-w-7xl mx-auto w-full py-6 sm:py-10 space-y-8">

      {/* Page header */}
      <header>
        <p className="ncx-num text-[10px] uppercase tracking-[0.22em] text-ncx-purple-300 mb-3">Overview</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ncx-text">Portfolio</h1>
      </header>

      {/* ── Analytics surface — big number left, mini-stats right ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Hero analytics card */}
        <div className="ncx-card p-6 sm:p-7 lg:col-span-2 relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-base font-semibold text-ncx-text-muted">Native balance</h4>
            <div
              className="inline-flex p-0.5 gap-0.5 rounded-full border border-ncx-border"
              style={{ background: 'var(--ncx-surface-2)' }}
            >
              {['24H', '7D', '30D', '1Y', 'ALL'].map((t, i) => (
                <button
                  key={t}
                  className={`px-3 py-1 rounded-full ncx-num text-[10px] uppercase tracking-[0.1em] transition-all duration-150 ${
                    i === 2
                      ? 'bg-ncx-purple-500 text-white'
                      : 'text-ncx-text-muted hover:text-ncx-text'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-baseline gap-3 mb-2">
            {nativeLoading ? (
              <Skeleton className="h-14 w-64" />
            ) : (
              <>
                <div className="ncx-num text-4xl sm:text-5xl lg:text-[2.75rem] font-medium tracking-tight text-ncx-text">
                  {nativeFormatted ? parseFloat(nativeFormatted).toFixed(4) : '—'}
                </div>
                <span className="text-xl font-medium text-ncx-text-muted">{nativeSymbol}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 mb-5">
            <TrendingUp className="w-3.5 h-3.5 text-ncx-gain" />
            <span className="ncx-num text-xs text-ncx-gain">↗ +0.00% · last 30d</span>
          </div>

          {/* Area chart on dot grid */}
          <svg
            viewBox="0 0 600 180"
            className="w-full block"
            style={{ height: 180, color: 'var(--ncx-purple-300)' }}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="ncx-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7B3FE4" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#7B3FE4" stopOpacity="0" />
              </linearGradient>
              <pattern id="ncx-dot-grid" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="currentColor" opacity="0.18" />
              </pattern>
            </defs>
            <rect width="600" height="180" fill="url(#ncx-dot-grid)" />
            <path d={chartPath.area} fill="url(#ncx-area-grad)" />
            <path
              d={chartPath.line}
              fill="none"
              stroke="#A97CFA"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={chartPath.lastX} cy={chartPath.lastY} r={5} fill="#A97CFA" />
            <circle cx={chartPath.lastX} cy={chartPath.lastY} r={10} fill="#A97CFA" opacity={0.25} />
          </svg>

          {/* EVM address line */}
          <div className="mt-5 pt-4 border-t border-ncx-border flex flex-wrap items-center gap-2">
            <span className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle">EVM</span>
            {evmLoading ? (
              <Skeleton className="h-3 w-60" />
            ) : evmAddress ? (
              <span className="ncx-num text-xs text-ncx-purple-300 break-all">{evmAddress}</span>
            ) : (
              <span className="ncx-num text-xs text-ncx-text-subtle">not mapped</span>
            )}
          </div>
        </div>

        {/* Mini-stats stack */}
        <div className="ncx-card p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          <div
            className="absolute -bottom-12 -left-12 w-48 h-48 pointer-events-none opacity-40"
            style={{ background: 'color-mix(in srgb, var(--ncx-gain) 12%, transparent)', borderRadius: 'var(--ncx-r-blob-b)' }}
            aria-hidden="true"
          />

          <div className="relative space-y-0">
            <div className="py-4 first:pt-0">
              <div className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle">Tokens held</div>
              <div className="ncx-num text-2xl font-medium tracking-tight text-ncx-text mt-1">{tokenCount}</div>
            </div>
            <div className="py-4 border-t border-ncx-border">
              <div className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle">Total native</div>
              <div className="ncx-num text-2xl font-medium tracking-tight text-ncx-text mt-1">
                {totalBalance > 0 ? totalBalance.toFixed(2) : '—'} <span className="text-base text-ncx-text-muted">{nativeSymbol}</span>
              </div>
            </div>
            <div className="py-4 border-t border-ncx-border">
              <div className="flex items-center gap-2 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle">
                <Target className="w-3.5 h-3.5 text-ncx-purple-300" />
                Staked
              </div>
              <div className="ncx-num text-2xl font-medium tracking-tight text-ncx-text-muted mt-1">—</div>
              <Link
                to="/staking"
                className="inline-flex items-center gap-1 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-purple-300 hover:text-ncx-text transition-colors duration-150 mt-1"
              >
                View staking <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <div className="relative flex flex-col gap-2 mt-4">
            <Link to="/swap" className="btn-ncx btn-ncx-primary" style={{ padding: '0.7rem 1rem' }}>
              <Plus className="w-4 h-4" /> Deposit
            </Link>
            <Link to="/pools" className="btn-ncx btn-ncx-secondary" style={{ padding: '0.7rem 1rem' }}>
              <Minus className="w-4 h-4" /> Withdraw
            </Link>
          </div>
        </div>
      </div>

      {/* ── Allocation bar ── */}
      <div className="ncx-card p-5">
        <p className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted mb-3">Allocation</p>
        <div className="flex h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--ncx-surface-2)' }}>
          {allTokens.map(({ colorClass }, i) => (
            <div key={i} className={`h-full ${colorClass}`} style={{ width: `${segmentPct}%` }} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
          {allTokens.map(({ symbol, colorClass }, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${colorClass}`} />
              <span className="ncx-num text-[10px] uppercase tracking-[0.12em] text-ncx-text-muted">{symbol}</span>
            </div>
          ))}
        </div>
      </div>

      {/* EVM account not mapped notice */}
      {evmMapped === false && (
        <div
          className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ background: 'var(--ncx-warn-bg)', border: '1px solid color-mix(in srgb, var(--ncx-warn) 35%, transparent)' }}
        >
          <AlertTriangle className="w-5 h-5 text-ncx-warn shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-ncx-warn mb-1">EVM account not mapped</p>
            <p className="text-xs text-ncx-text-muted leading-relaxed">
              To see ERC20 token balances, call the{' '}
              <span className="font-semibold text-ncx-text">revive → mapAccount</span> extrinsic once via the QF Network portal.
              Your native balance is shown above.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Assets List */}
        <div className="ncx-card overflow-hidden lg:col-span-1">
          <div className="flex items-center justify-between p-5 border-b border-ncx-border">
            <h3 className="text-base font-semibold text-ncx-text">Your assets</h3>
            <span className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle">{tokenCount} tokens</span>
          </div>

          <div>
            {/* Native token row */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-ncx-border/40 hover:bg-ncx-wash transition-colors duration-150 cursor-pointer">
              <div className="flex items-center gap-3">
                <TokenIcon token={nativeToken ?? { symbol: nativeSymbol }} className="w-9 h-9 rounded-full" fallbackClassName="text-sm" />
                <div>
                  <div className="font-semibold text-ncx-text text-sm">{nativeSymbol}</div>
                  <div className="ncx-num text-[10px] uppercase tracking-[0.12em] text-ncx-text-subtle">Native</div>
                </div>
              </div>
              <div className="text-right">
                {nativeLoading
                  ? <Skeleton className="h-4 w-16 ml-auto" />
                  : <div className="ncx-num text-sm text-ncx-text">{nativeFormatted ? parseFloat(nativeFormatted).toFixed(4) : '—'}</div>}
              </div>
            </div>

            {/* ERC20 token rows */}
            {erc20Rows.map((token, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3.5 border-b border-ncx-border/40 last:border-b-0 hover:bg-ncx-wash transition-colors duration-150 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <TokenIcon token={token} className="w-9 h-9 rounded-full" fallbackClassName="text-sm" />
                  <div className="min-w-0">
                    <div className="font-semibold text-ncx-text text-sm truncate">{token.symbol}</div>
                    <div className="text-xs text-ncx-text-muted truncate">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  {evmLoading
                    ? <Skeleton className="h-4 w-16 ml-auto" />
                    : <div className="ncx-num text-sm text-ncx-text">{token.formatted ?? '—'}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="ncx-card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between p-5 border-b border-ncx-border">
            <h3 className="text-base font-semibold text-ncx-text flex items-center gap-2">
              <History className="w-4 h-4 text-ncx-purple-300" /> Recent history
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <div
              className="w-12 h-12 rounded-full grid place-items-center"
              style={{ background: 'var(--ncx-wash)' }}
            >
              <History className="w-5 h-5 text-ncx-purple-300" />
            </div>
            <p className="text-sm font-semibold text-ncx-text">No activity yet</p>
            <p className="text-xs text-ncx-text-muted max-w-xs">
              Transaction history will appear here once you start swapping or providing liquidity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
