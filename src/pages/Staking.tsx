import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Staking() {
  const mockStakingPools = [
    { stakedToken: 'NCL', rewardToken: 'NCL', tvl: '$1.4M', apy: '15.2%' },
  ]

  return (
    <div className="max-w-6xl mx-auto w-full py-6 sm:py-10 space-y-8">
      <header>
        <p className="ncx-num text-[10px] uppercase tracking-[0.22em] text-ncx-purple-300 mb-3">Earn</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ncx-text">Staking</h1>
        <p className="text-ncx-text-muted mt-2 max-w-xl">
          Stake your NCL tokens to earn protocol revenue and participate in on-chain governance.
        </p>
      </header>

      <div className="ncx-card overflow-hidden">
        <div className="p-5 border-b border-ncx-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ncx-text">Staking pools</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ncx-text-subtle" />
            <input
              type="text"
              placeholder="Search pools"
              className="ncx-input pl-10 py-2.5 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-ncx-border" style={{ background: 'var(--ncx-surface-2)' }}>
                <th className="px-6 py-3.5 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle">Staked</th>
                <th className="px-6 py-3.5 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle">Reward</th>
                <th className="px-6 py-3.5 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle">TVL</th>
                <th className="px-6 py-3.5 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle text-right">APY</th>
                <th className="px-6 py-3.5 text-right" />
              </tr>
            </thead>
            <tbody>
              {mockStakingPools.map((pool, i) => (
                <tr key={i} className="border-b border-ncx-border/50 last:border-b-0 transition-colors duration-150 group hover:bg-ncx-wash">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-ncx-text text-sm">{pool.stakedToken}</span>
                  </td>
                  <td className="px-6 py-4 ncx-num text-sm text-ncx-text-muted">{pool.rewardToken}</td>
                  <td className="px-6 py-4 ncx-num text-sm text-ncx-text">{pool.tvl}</td>
                  <td className="px-6 py-4 ncx-num text-sm text-ncx-gain text-right font-medium">{pool.apy}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/staking/${pool.stakedToken}`}
                      className="ncx-num text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-ncx-border bg-ncx-surface-2 text-ncx-text-muted hover:border-ncx-purple-500 hover:text-ncx-text hover:bg-ncx-wash transition-all duration-200 inline-block"
                    >
                      Stake
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
