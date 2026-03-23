import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MOCK_TOKENS } from '../components/TokenModal'

export default function Farms() {
  const mockFarms = [
    { stakedToken: 'DOT', rewardToken: 'NCL', tvl: '$12.4M', apy: '114.2%' },
    { stakedToken: 'WETH', rewardToken: 'NCL', tvl: '$45.1M', apy: '88.5%' },
    { stakedToken: 'USDC', rewardToken: 'NCL', tvl: '$104.2M', apy: '42.1%' },
    { stakedToken: 'USDT', rewardToken: 'NCL', tvl: '$5.6M', apy: '128.4%' },
  ]

  return (
    <div className="max-w-6xl mx-auto w-full py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-200">Farms</h1>
          <p className="text-slate-400 mt-1">Stake your tokens to earn rewards in Nucleus tokens</p>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-indigo-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <h2 className="text-xl font-bold text-slate-200">All Farms</h2>
           <div className="relative w-full sm:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
             <input 
               type="text"
               placeholder="Search farms"
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
              {mockFarms.map((farm, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {(() => {
                          const tA = MOCK_TOKENS.find(t => t.symbol === farm.stakedToken);
                          return (
                            <>
                              {tA?.iconClass ? <div className={`${tA.iconClass} w-8 h-8 rounded-full bg-white ring-2 ring-slate-900 z-10 shadow-lg drop-shadow-md`} /> : <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white text-xs ring-2 ring-slate-900 z-10 shadow-lg drop-shadow-md">{farm.stakedToken[0]}</div>}
                            </>
                          )
                        })()}
                      </div>
                      <span className="font-bold text-slate-200">{farm.stakedToken}</span>
                    </div>
                  </td>
                  <td className="p-6 text-slate-300 font-mono">{farm.rewardToken}</td>
                  <td className="p-6 text-slate-300 font-mono">{farm.tvl}</td>
                  <td className="p-6 text-green-400 font-mono font-bold text-right">{farm.apy}</td>
                  <td className="p-6 text-right">
                    <Link to={`/farms/${farm.stakedToken}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 hover:text-indigo-300 font-bold text-sm bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-lg inline-block">
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