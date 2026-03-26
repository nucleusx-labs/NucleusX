import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { KNOWN_TOKENS } from '../components/TokenModal'

export default function Farms() {
  const mockFarms = [
    { stakedToken: 'DOT', rewardToken: 'NCL', tvl: '$12.4M', apy: '114.2%' },
    { stakedToken: 'WETH', rewardToken: 'NCL', tvl: '$45.1M', apy: '88.5%' },
    { stakedToken: 'USDC', rewardToken: 'NCL', tvl: '$104.2M', apy: '42.1%' },
    { stakedToken: 'USDT', rewardToken: 'NCL', tvl: '$5.6M', apy: '128.4%' },
  ]

  return (
    <div className="max-w-6xl mx-auto w-full py-8 space-y-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A1A1A1] mb-2">Yield</p>
        <h1 className="text-5xl font-bold tracking-tighter text-[#F2F2F2]">Farms</h1>
        <p className="text-[#A1A1A1] mt-2 text-sm font-bold uppercase tracking-[0.15em]">Stake your tokens to earn rewards in Nucleus tokens</p>
      </div>

      <div className="border-2 border-[#2D0A5B]">
        <div className="p-5 border-b border-[#2D0A5B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold uppercase tracking-widest text-[#F2F2F2]">All Farms</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A1]" />
            <input
              type="text"
              placeholder="Search farms"
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
              {mockFarms.map((farm, i) => (
                <tr key={i} className="border-b border-[#2D0A5B]/50 last:border-b-0 hover:bg-[#2D0A5B] transition-colors duration-150 group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const token = KNOWN_TOKENS.find((t: { symbol: string }) => t.symbol === farm.stakedToken)
                        return token?.iconClass
                          ? <div className={`${token.iconClass} w-8 h-8 rounded-full`} />
                          : <div className="w-8 h-8 bg-[#2D0A5B] flex items-center justify-center text-[#7B3FE4] font-bold text-sm">{farm.stakedToken[0]}</div>
                      })()}
                      <span className="font-bold uppercase text-[#F2F2F2] tracking-wider">{farm.stakedToken}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-[#A1A1A1]">{farm.rewardToken}</td>
                  <td className="px-6 py-5 font-bold text-[#F2F2F2]">{farm.tvl}</td>
                  <td className="px-6 py-5 font-bold text-[#00D084] text-right">{farm.apy}</td>
                  <td className="px-6 py-5 text-right">
                    <Link
                      to={`/farms/${farm.stakedToken}`}
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
