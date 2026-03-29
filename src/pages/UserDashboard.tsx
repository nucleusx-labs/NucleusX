import { useEffect, useState } from 'react'
import { Wallet, History, ArrowUpRight, Target, Plus, Minus, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAtom } from '@xstate/store/react'
import { selectedAccount } from '../hooks/useConnect'
import { useTokenBalances } from '../hooks/useTokenBalances'
import { getBalance } from '../utils/sdk-interface'
import { checkAccountMapping } from '../utils/revive'
import { KNOWN_TOKENS } from '../components/TokenModal'
import sdk from '../utils/sdk'

const TOKEN_COLORS = ['bg-[#7B3FE4]', 'bg-[#00D084]', 'bg-[#E4A83F]', 'bg-[#3F9BE4]']

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-[#2D0A5B] rounded-sm ${className ?? ''}`} />
}

export default function UserDashboard() {
  const account = useAtom(selectedAccount)

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
    setEvmLoading(true)
    setEvmMapped(null)

    async function resolveEvmAddress() {
      try {
        const { api } = sdk('qf_network')
        const mapping = await checkAccountMapping(api, account!.address)
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
    KNOWN_TOKENS.map(t => t.address),
  )

  // Build asset rows: native first, then ERC20 tokens with non-zero or all
  const nativeSymbol = nativeBalance?.symbol ?? 'QF'
  const nativeFormatted = nativeBalance?.balance ?? null

  const erc20Rows = KNOWN_TOKENS.map((token, i) => ({
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
      <div className="max-w-7xl mx-auto w-full py-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A1A1A1] mb-2">Overview</p>
          <h1 className="text-5xl font-bold tracking-tighter text-[#F2F2F2]">Portfolio</h1>
        </div>
        <div className="mt-20 flex flex-col items-center gap-5 text-center">
          <div className="w-16 h-16 border-2 border-[#2D0A5B] flex items-center justify-center">
            <Wallet className="w-7 h-7 text-[#7B3FE4]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#F2F2F2]">No wallet connected</h2>
          <p className="text-sm text-[#A1A1A1] max-w-xs">
            Connect your Talisman wallet using the button in the header to view your portfolio.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto w-full py-8 space-y-10">

      {/* Page header */}
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A1A1A1] mb-2">Overview</p>
        <h1 className="text-5xl font-bold tracking-tighter text-[#F2F2F2]">Portfolio</h1>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Native Balance — hero metric */}
        <div className="border-2 border-[#2D0A5B] p-8 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-[#7B3FE4]" />
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">Native Balance</p>
          </div>
          <div className="flex items-baseline gap-4 mb-6">
            {nativeLoading
              ? <Skeleton className="h-14 w-52" />
              : (
                  <>
                    <div className="text-6xl font-bold tracking-tighter text-[#F2F2F2]">
                      {nativeFormatted ? parseFloat(nativeFormatted).toFixed(4) : '—'}
                    </div>
                    <span className="text-xl font-bold text-[#A1A1A1]">{nativeSymbol}</span>
                  </>
                )}
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#A1A1A1] w-12 shrink-0">SS58</span>
              <span className="font-mono text-xs text-[#A1A1A1] truncate">{account.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#A1A1A1] w-12 shrink-0">EVM</span>
              {evmLoading
                ? <Skeleton className="h-3 w-52" />
                : evmAddress
                  ? <span className="font-mono text-xs text-[#7B3FE4]">{evmAddress}</span>
                  : <span className="font-mono text-xs text-[#A1A1A1]/40">not mapped</span>}
            </div>
          </div>

          {/* Allocation bar */}
          <div className="mt-6">
            <div className="flex h-1.5 border border-[#2D0A5B] overflow-hidden">
              {allTokens.map(({ colorClass }, i) => (
                <div key={i} className={`h-full ${colorClass}`} style={{ width: `${segmentPct}%` }} />
              ))}
            </div>
            <div className="flex items-center gap-6 mt-2">
              {allTokens.map(({ symbol, colorClass }) => (
                <div key={symbol} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${colorClass}`} />
                  <span className="text-xs font-bold uppercase text-[#A1A1A1]">{symbol}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staked + CTAs */}
        <div className="border-2 border-[#2D0A5B] p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-[#7B3FE4]" />
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">Staked</p>
            </div>
            <div className="text-4xl font-bold tracking-tighter text-[#A1A1A1] mb-4">—</div>
            <Link
              to="/staking"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150"
            >
              View Staking <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-2 mt-6">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#7B3FE4] text-[#F2F2F2] text-sm font-bold uppercase tracking-widest hover:bg-[#2D0A5B] transition-colors duration-150">
              <Plus className="w-4 h-4" /> Deposit
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 border border-[#2D0A5B] text-[#A1A1A1] text-sm font-bold uppercase tracking-widest hover:bg-[#2D0A5B] hover:text-[#F2F2F2] transition-colors duration-150">
              <Minus className="w-4 h-4" /> Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* EVM account not mapped notice */}
      {evmMapped === false && (
        <div className="flex items-start gap-4 border border-[#E4A83F]/40 bg-[#E4A83F]/5 p-5">
          <AlertTriangle className="w-5 h-5 text-[#E4A83F] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#E4A83F] mb-1">EVM account not mapped</p>
            <p className="text-xs text-[#A1A1A1] leading-relaxed">
              To see ERC20 token balances, call the{' '}
              <span className="font-bold text-[#F2F2F2]">revive → mapAccount</span> extrinsic once via the QF Network portal.
              Your native balance is shown below.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Assets List */}
        <div className="border-2 border-[#2D0A5B] lg:col-span-1">
          <div className="flex items-center justify-between p-6 border-b border-[#2D0A5B]">
            <h3 className="text-base font-bold uppercase tracking-widest text-[#F2F2F2]">Your Assets</h3>
            <span className="text-xs text-[#A1A1A1] font-bold uppercase tracking-widest">{tokenCount} tokens</span>
          </div>

          <div>
            {/* Native token row */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D0A5B]/50 hover:bg-[#2D0A5B] transition-colors duration-150 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#2D0A5B] flex items-center justify-center text-[#7B3FE4] font-bold text-sm">
                  {nativeSymbol[0]}
                </div>
                <div>
                  <div className="font-bold uppercase text-[#F2F2F2] text-sm">{nativeSymbol}</div>
                  <div className="text-xs text-[#A1A1A1]">Native</div>
                </div>
              </div>
              <div className="text-right">
                {nativeLoading
                  ? <Skeleton className="h-4 w-16 ml-auto" />
                  : <div className="font-bold text-[#F2F2F2] text-sm">{nativeFormatted ? parseFloat(nativeFormatted).toFixed(4) : '—'}</div>}
              </div>
            </div>

            {/* ERC20 token rows */}
            {erc20Rows.map((token, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-4 border-b border-[#2D0A5B]/50 last:border-b-0 hover:bg-[#2D0A5B] transition-colors duration-150 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#2D0A5B] flex items-center justify-center text-[#7B3FE4] font-bold text-sm">
                    {token.symbol[0]}
                  </div>
                  <div>
                    <div className="font-bold uppercase text-[#F2F2F2] text-sm">{token.symbol}</div>
                    <div className="text-xs text-[#A1A1A1]">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  {evmLoading
                    ? <Skeleton className="h-4 w-16 ml-auto" />
                    : <div className="font-bold text-[#F2F2F2] text-sm">{token.formatted ?? '—'}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="border-2 border-[#2D0A5B] lg:col-span-2">
          <div className="flex items-center justify-between p-6 border-b border-[#2D0A5B]">
            <h3 className="text-base font-bold uppercase tracking-widest text-[#F2F2F2] flex items-center gap-2">
              <History className="w-4 h-4 text-[#7B3FE4]" /> Recent History
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
            <History className="w-8 h-8 text-[#2D0A5B]" />
            <p className="text-sm font-bold uppercase tracking-widest text-[#A1A1A1]">No activity</p>
            <p className="text-xs text-[#A1A1A1] max-w-xs">
              Transaction history is not available yet. On-chain indexing coming soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
