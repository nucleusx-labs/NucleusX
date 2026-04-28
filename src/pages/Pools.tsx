import { Search, Loader2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import TokenIcon from '../components/TokenIcon'
import { usePools } from '../hooks/usePools'

function PoolTokenIcon({ tokenSymbol, token }: { tokenSymbol: string, token?: { symbol: string } }) {
  return <TokenIcon token={token ?? { symbol: tokenSymbol }} className="w-7 h-7 rounded-full" ringClassName="ring-2 ring-ncx-surface" fallbackClassName="text-[10px]" />
}

export default function Pools() {
  const { pools, isLoading } = usePools()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return pools

    return pools.filter(pool =>
      pool.tokenA.symbol.toLowerCase().includes(query)
      || pool.tokenB.symbol.toLowerCase().includes(query)
      || pool.tokenA.name.toLowerCase().includes(query)
      || pool.tokenB.name.toLowerCase().includes(query)
      || pool.actualTokenA.toLowerCase().includes(query)
      || pool.actualTokenB.toLowerCase().includes(query)
      || pool.pairAddress.toLowerCase().includes(query),
    )
  }, [pools, searchQuery])

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
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
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
                <th className="px-6 py-3.5 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle">Your LP</th>
                <th className="px-6 py-3.5 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle text-right">Fee</th>
                <th className="px-6 py-3.5 text-right" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-ncx-purple-300" />
                    <p className="text-ncx-text-muted text-sm">Fetching pools…</p>
                  </td>
                </tr>
              ) : filteredPools.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-ncx-text-muted text-sm">
                    {pools.length === 0
                      ? 'No liquidity pools yet. Add liquidity to get started.'
                      : 'No pools match your search.'}
                  </td>
                </tr>
              ) : filteredPools.map((pool) => (
                <tr
                  key={pool.pairAddress}
                  className="border-b border-ncx-border/50 last:border-b-0 transition-colors duration-150 group hover:bg-ncx-wash"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2.5">
                        <PoolTokenIcon tokenSymbol={pool.tokenA.symbol} token={pool.tokenA} />
                        <PoolTokenIcon tokenSymbol={pool.tokenB.symbol} token={pool.tokenB} />
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
                  <td className="px-6 py-4">
                    <div className="ncx-num text-sm text-ncx-text">{pool.userLiquidityFormatted} LP</div>
                    <div className="text-[11px] text-ncx-text-subtle">{pool.userSharePercent} share</div>
                  </td>
                  <td className="px-6 py-4 ncx-num text-sm text-ncx-gain text-right">{pool.fee}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/add-liquidity?tokenA=${pool.tokenA.address}&tokenB=${pool.tokenB.address}`}
                        className="ncx-num text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-ncx-border bg-ncx-surface-2 text-ncx-text-muted hover:border-ncx-purple-500 hover:text-ncx-text hover:bg-ncx-wash transition-all duration-200 inline-block"
                      >
                        Add
                      </Link>
                      <Link
                        to={`/remove-liquidity?pair=${pool.pairAddress}`}
                        className={`ncx-num text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border transition-all duration-200 inline-block ${
                          pool.hasPosition
                            ? 'border-ncx-purple-500/40 bg-ncx-purple-500/10 text-ncx-text hover:border-ncx-purple-500 hover:bg-ncx-purple-500/20'
                            : 'border-ncx-border bg-ncx-surface-2 text-ncx-text-subtle hover:border-ncx-purple-500 hover:text-ncx-text hover:bg-ncx-wash'
                        }`}
                      >
                        Remove
                      </Link>
                    </div>
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
