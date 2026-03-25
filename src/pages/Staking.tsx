import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Staking() {
  const mockStakingPools = [
    { stakedToken: 'NCL', rewardToken: 'NCL', tvl: '$1.4M', apy: '15.2%' },
  ]

  return (
    <div className="max-w-6xl mx-auto w-full py-8 space-y-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A1A1A1] mb-2">Earn</p>
        <h1 className="text-5xl font-bold tracking-tighter text-[#F2F2F2]">Staking</h1>
        <p className="text-[#A1A1A1] mt-2 text-sm font-bold uppercase tracking-[0.15em]">Stake your Nucleus tokens to earn more</p>
      </div>

      <div className="border-2 border-[#2D0A5B]">
        <div className="p-5 border-b border-[#2D0A5B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold uppercase tracking-widest text-[#F2F2F2]">Staking Pools</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A1]" />
            <input
              type="text"
              placeholder="Search pools"
              className="w-full bg-transparent border border-[#2D0A5B] py-2 pl-9 pr-4 text-[#F2F2F2] focus:outline-none focus:border-[#7B3FE4] text-sm uppercase tracking-wider placeholder:text-[#A1A1A1]/50 transition-colors duration-150"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-[#2D0A5B]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">Staked Token</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">Reward Token</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">TVL</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1] text-right">APY</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockStakingPools.map((pool, i) => (
                <tr key={i} className="border-b border-[#2D0A5B]/50 last:border-b-0 hover:bg-[#2D0A5B] transition-colors duration-150 group">
                  <td className="px-6 py-5">
                    <span className="font-bold uppercase text-[#F2F2F2] tracking-wider">{pool.stakedToken}</span>
                  </td>
                  <td className="px-6 py-5 font-bold text-[#A1A1A1]">{pool.rewardToken}</td>
                  <td className="px-6 py-5 font-bold text-[#F2F2F2]">{pool.tvl}</td>
                  <td className="px-6 py-5 font-bold text-[#00D084] text-right">{pool.apy}</td>
                  <td className="px-6 py-5 text-right">
                    <Link
                      to={`/staking/${pool.stakedToken}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-xs font-bold uppercase tracking-widest border border-[#7B3FE4] text-[#7B3FE4] px-4 py-2 inline-block hover:bg-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150"
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
