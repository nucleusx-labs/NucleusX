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
    <div className="max-w-6xl mx-auto w-full py-8 space-y-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-brutalist-text">Farms</h1>
          <p className="text-brutalist-text-muted mt-1 font-bold text-sm uppercase tracking-wider">Stake your tokens to earn rewards in Nucleus tokens</p>
        </div>
      </div>

      <div className="panel-brutal overflow-hidden">
        <div className="p-4 border-b-[3px] border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-xl font-black uppercase tracking-tight text-brutalist-panel-text">All Farms</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brutalist-text-muted" />
            <input
              type="text"
              placeholder="Search farms"
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
              {mockFarms.map((farm, i) => (
                <tr key={i} className="hover:bg-brutalist-hover transition-colors duration-75 group">
                  <td className="td-brutal">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const tA = MOCK_TOKENS.find(t => t.symbol === farm.stakedToken)
                        return tA?.iconClass
                          ? <div className={`${tA.iconClass} w-8 h-8 rounded-full bg-white border-[2px] border-black shadow-[2px_2px_0_#000]`} />
                          : <div className="w-8 h-8 bg-brutalist-accent flex items-center justify-center font-black text-black text-xs border-[2px] border-black shadow-[2px_2px_0_#000]">{farm.stakedToken[0]}</div>
                      })()}
                      <span className="font-black uppercase text-brutalist-panel-text">{farm.stakedToken}</span>
                    </div>
                  </td>
                  <td className="td-brutal font-mono font-bold text-brutalist-panel-text">{farm.rewardToken}</td>
                  <td className="td-brutal font-mono font-bold text-brutalist-panel-text">{farm.tvl}</td>
                  {/* Teal for APY (positive data/yield) */}
                  <td className="td-brutal font-mono font-black text-brutalist-teal text-right">{farm.apy}</td>
                  <td className="td-brutal text-right">
                    <Link to={`/farms/${farm.stakedToken}`} className="opacity-0 group-hover:opacity-100 transition-opacity duration-75 font-black text-xs uppercase border-[2px] border-black bg-brutalist-accent text-black px-4 py-2 inline-block shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
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
