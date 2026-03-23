import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Staking() {
  const mockStakingPools = [
    { stakedToken: 'NCL', rewardToken: 'NCL', tvl: '$1.4M', apy: '15.2%' },
  ]

  return (
    <div className="max-w-6xl mx-auto w-full py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Staking</h1>
          <p className="text-slate-400 mt-1">Stake your Nucleus tokens to earn more</p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-indigo-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <h2 className="text-xl font-bold text-slate-200">Staking Pools</h2>
           <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
             <input 
               type="text"
               placeholder="Search pools"
               className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-all text-sm"
             />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-indigo-500/10 text-slate-400 text-sm">
                <th className="p-6 font-semibold cursor-pointer hover:text-slate-200">Staked Token</th>
                <th className="p-6 font-semibold cursor-pointer hover:text-slate-200">Reward Token</th>
                <th className="p-6 font-semibold cursor-pointer hover:text-slate-200">TVL</th>
                <th className="p-6 font-semibold cursor-pointer hover:text-slate-200 text-right">APY</th>
                <th className="p-6 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-500/5">
              {mockStakingPools.map((pool, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-200">{pool.stakedToken}</span>
                    </div>
                  </td>
                  <td className="p-6 text-slate-300 font-mono">{pool.rewardToken}</td>
                  <td className="p-6 text-slate-300 font-mono">{pool.tvl}</td>
                  <td className="p-6 text-green-400 font-mono font-bold text-right">{pool.apy}</td>
                  <td className="p-6 text-right">
                    <Link to={`/staking/${pool.stakedToken}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 hover:text-indigo-300 font-bold text-sm bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-lg inline-block">
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
