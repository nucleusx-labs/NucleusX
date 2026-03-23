import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Staking() {
  const mockStakingPools = [
    { stakedToken: 'NCL', rewardToken: 'NCL', tvl: '$1.4M', apy: '15.2%' },
  ]

  return (
    <div className="max-w-6xl mx-auto w-full py-8 space-y-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-brutalist-text">Staking</h1>
          <p className="text-brutalist-text-muted mt-1 font-bold text-sm uppercase tracking-wider">Stake your Nucleus tokens to earn more</p>
        </div>
      </div>

      <div className="panel-brutal overflow-hidden">
        <div className="p-4 border-b-[3px] border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-brutalist-panel-text">Staking Pools</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutalist-text-muted" />
            <input
              type="text"
              placeholder="Search pools"
              className="w-full bg-brutalist-input-bg border-[2px] border-black py-2 pl-9 pr-4 text-brutalist-panel-text focus:outline-none font-bold text-sm uppercase tracking-wider placeholder:text-brutalist-text-muted"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b-[3px] border-black">
                <th className="th-brutal">Staked Token</th>
                <th className="th-brutal">Reward Token</th>
                <th className="th-brutal">TVL</th>
                <th className="th-brutal text-right">APY</th>
                <th className="th-brutal text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockStakingPools.map((pool, i) => (
                <tr key={i} className="hover:bg-brutalist-hover transition-colors duration-75 group">
                  <td className="td-brutal">
                    <span className="font-black uppercase text-brutalist-panel-text">{pool.stakedToken}</span>
                  </td>
                  <td className="td-brutal font-mono font-bold text-brutalist-panel-text">{pool.rewardToken}</td>
                  <td className="td-brutal font-mono font-bold text-brutalist-panel-text">{pool.tvl}</td>
                  {/* Teal for APY */}
                  <td className="td-brutal font-mono font-black text-brutalist-teal text-right">{pool.apy}</td>
                  <td className="td-brutal text-right">
                    <Link to={`/staking/${pool.stakedToken}`} className="opacity-0 group-hover:opacity-100 transition-opacity duration-75 font-black text-xs uppercase border-[2px] border-black bg-brutalist-accent text-black px-4 py-2 inline-block shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
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
