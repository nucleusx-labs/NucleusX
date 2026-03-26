import { Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { KNOWN_TOKENS } from '../components/TokenModal'

const mockPools = [
  { tokenA: 'DOT', tokenB: 'USDC', tvl: '$28.3M', volume24h: '$4.1M', fee: '0.3%' },
  { tokenA: 'WETH', tokenB: 'USDC', tvl: '$91.7M', volume24h: '$18.4M', fee: '0.3%' },
  { tokenA: 'DOT', tokenB: 'USDT', tvl: '$14.6M', volume24h: '$2.9M', fee: '0.05%' },
  { tokenA: 'WETH', tokenB: 'DOT', tvl: '$33.2M', volume24h: '$7.8M', fee: '0.3%' },
  { tokenA: 'USDC', tokenB: 'USDT', tvl: '$210.5M', volume24h: '$52.1M', fee: '0.01%' },
]

function TokenIcon({ symbol }: { symbol: string }) {
  const token = KNOWN_TOKENS.find((t: { symbol: string }) => t.symbol === symbol)
  if (token?.iconClass) {
    return <div className={`${token.iconClass} w-7 h-7 rounded-full`} />
  }
  return (
    <div className="w-7 h-7 bg-[#2D0A5B] flex items-center justify-center text-[#7B3FE4] font-bold text-xs">
      {symbol[0]}
    </div>
  )
}

export default function Pools() {
  return (
    <div className="max-w-6xl mx-auto w-full py-8 space-y-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A1A1A1] mb-2">Liquidity</p>
        <h1 className="text-5xl font-bold tracking-tighter text-[#F2F2F2]">Pools</h1>
        <p className="text-[#A1A1A1] mt-2 text-sm font-bold uppercase tracking-[0.15em]">Add liquidity to a pool and earn fees on every trade</p>
      </div>

      <div className="border-2 border-[#2D0A5B]">
        <div className="p-5 border-b border-[#2D0A5B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold uppercase tracking-widest text-[#F2F2F2]">All Pools</h2>
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
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">Pool</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">TVL</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">Volume 24H</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1] text-right">Fee</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockPools.map((pool, i) => (
                <tr key={i} className="border-b border-[#2D0A5B]/50 last:border-b-0 hover:bg-[#2D0A5B] transition-colors duration-150 group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <TokenIcon symbol={pool.tokenA} />
                        <TokenIcon symbol={pool.tokenB} />
                      </div>
                      <span className="font-bold uppercase text-[#F2F2F2] tracking-wider">
                        {pool.tokenA}/{pool.tokenB}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-[#F2F2F2]">{pool.tvl}</td>
                  <td className="px-6 py-5 font-bold text-[#F2F2F2]">{pool.volume24h}</td>
                  <td className="px-6 py-5 font-bold text-[#00D084] text-right">{pool.fee}</td>
                  <td className="px-6 py-5 text-right">
                    <Link
                      to={`/add-liquidity?tokenA=${pool.tokenA}&tokenB=${pool.tokenB}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-xs font-bold uppercase tracking-widest border border-[#7B3FE4] text-[#7B3FE4] px-4 py-2 inline-block hover:bg-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150"
                    >
                      Add
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
