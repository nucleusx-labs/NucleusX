import { Search, Loader2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSelector } from '@xstate/store/react'
import { dexStore, selectTokenList } from '../store/dexStore'
import { usePools } from '../hooks/usePools'

function TokenIcon({ symbol }: { symbol: string }) {
  const tokenList = useSelector(dexStore, selectTokenList)
  const token = tokenList.find(t => t.symbol === symbol)
  if (token?.iconClass) {
    return <span className={`${token.iconClass} w-7 h-7 rounded-full ring-2 ring-ncx-surface`} />
  }
  return (
    <span
      className="w-7 h-7 rounded-full grid place-items-center text-white font-bold text-[10px] ring-2 ring-ncx-surface"
      style={{ background: 'linear-gradient(135deg, var(--ncx-purple-300), var(--ncx-purple-700))' }}
    >
      {symbol[0]}
    </span>
  )
}

export default function Pools() {
  const { pools, isLoading } = usePools()

  return (
    <div className="max-w-6xl mx-auto w-full py-6 sm:py-10 space-y-8">
      <header>
        <p className="ncx-num text-[10px] uppercase tracking-[0.22em] text-ncx-purple-300 mb-3">Liquidity</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ncx-text">Pools</h1>
        <p className="text-ncx-text-muted mt-2 max-w-xl">
          Add liquidity to a pool and earn a share of every trade. Multiple fee tiers for any strategy.
        </p>
      </header>

      <div className="ncx-card overflow-hidden">
        <div className="p-5 border-b border-ncx-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ncx-text">All pools</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ncx-text-subtle" />
              <input
                type="text"
                placeholder="Search pools"
                className="ncx-input pl-10 py-2.5 text-sm"
              />
            </div>
            <Link to="/add-liquidity" className="btn-ncx btn-ncx-primary shrink-0" style={{ padding: '0.625rem 1rem', fontSize: '0.8125rem' }}>
              <Plus className="w-3.5 h-3.5" />
              Add liquidity
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-ncx-border" style={{ background: 'var(--ncx-surface-2)' }}>
                <th className="px-6 py-3.5 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle">Pool</th>
                <th className="px-6 py-3.5 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle">TVL</th>
                <th className="px-6 py-3.5 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle">Volume · 24h</th>
                <th className="px-6 py-3.5 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle text-right">Fee</th>
                <th className="px-6 py-3.5 text-right" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-ncx-purple-300" />
                    <p className="text-ncx-text-muted text-sm">Fetching pools…</p>
                  </td>
                </tr>
              ) : pools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-ncx-text-muted text-sm">
                    No liquidity pools yet. Add liquidity to get started.
                  </td>
                </tr>
              ) : pools.map((pool, i) => (
                <tr
                  key={i}
                  className="border-b border-ncx-border/50 last:border-b-0 transition-colors duration-150 group hover:bg-ncx-wash"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2.5">
                        <TokenIcon symbol={pool.tokenA.symbol} />
                        <TokenIcon symbol={pool.tokenB.symbol} />
                      </div>
                      <div>
                        <div className="font-semibold text-ncx-text text-sm">
                          {pool.tokenA.symbol} · {pool.tokenB.symbol}
                        </div>
                        <div className="ncx-num text-[10px] uppercase tracking-[0.1em] text-ncx-text-subtle">v2 · 0.30%</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 ncx-num text-sm text-ncx-text">{pool.tvl}</td>
                  <td className="px-6 py-4 ncx-num text-sm text-ncx-text-muted">{pool.volume24h}</td>
                  <td className="px-6 py-4 ncx-num text-sm text-ncx-gain text-right">{pool.fee}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/add-liquidity?tokenA=${pool.tokenA.symbol}&tokenB=${pool.tokenB.symbol}`}
                      className="ncx-num text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-ncx-border bg-ncx-surface-2 text-ncx-text-muted hover:border-ncx-purple-500 hover:text-ncx-text hover:bg-ncx-wash transition-all duration-200 inline-block"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
