import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSelector } from '@xstate/store/react'
import TokenIcon from '../components/TokenIcon'
import { dexStore, selectTokenList } from '../store/dexStore'

export default function Farms() {
  const tokenList = useSelector(dexStore, selectTokenList)
  const mockFarms = [
    { stakedToken: 'DOT', rewardToken: 'NCL', tvl: '$12.4M', apy: '114.2%' },
    { stakedToken: 'WETH', rewardToken: 'NCL', tvl: '$45.1M', apy: '88.5%' },
    { stakedToken: 'USDC', rewardToken: 'NCL', tvl: '$104.2M', apy: '42.1%' },
    { stakedToken: 'USDT', rewardToken: 'NCL', tvl: '$5.6M', apy: '128.4%' },
  ]

  return (
    <div className="max-w-6xl mx-auto w-full py-6 sm:py-10 space-y-8">
      <header>
        <p className="ncx-num text-[10px] uppercase tracking-[0.22em] text-ncx-purple-300 mb-3">Yield</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ncx-text">Farms</h1>
        <p className="text-ncx-text-muted mt-2 max-w-xl">
          Stake your tokens to earn boosted NCL rewards. Withdraw anytime, no lockups.
        </p>
      </header>

      <div className="ncx-card overflow-hidden">
        <div className="p-5 border-b border-ncx-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ncx-text">All farms</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ncx-text-subtle" />
            <input
              type="text"
              placeholder="Search farms"
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
              {mockFarms.map((farm, i) => {
                const token = tokenList.find(t => t.symbol === farm.stakedToken)
                return (
                  <tr key={i} className="border-b border-ncx-border/50 last:border-b-0 transition-colors duration-150 group hover:bg-ncx-wash">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <TokenIcon token={token ?? { symbol: farm.stakedToken }} className="w-8 h-8 rounded-full" fallbackClassName="text-xs" />
                        <span className="font-semibold text-ncx-text text-sm">{farm.stakedToken}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 ncx-num text-sm text-ncx-text-muted">{farm.rewardToken}</td>
                    <td className="px-6 py-4 ncx-num text-sm text-ncx-text">{farm.tvl}</td>
                    <td className="px-6 py-4 ncx-num text-sm text-ncx-gain text-right font-medium">{farm.apy}</td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/farms/${farm.stakedToken}`}
                        className="ncx-num text-[10px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border border-ncx-border bg-ncx-surface-2 text-ncx-text-muted hover:border-ncx-purple-500 hover:text-ncx-text hover:bg-ncx-wash transition-all duration-200 inline-block"
                      >
                        Stake
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
