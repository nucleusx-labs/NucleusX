import { BarChart3, TrendingUp } from 'lucide-react'
import { useState } from 'react'

export default function PriceChart() {
  const [activePeriod, setActivePeriod] = useState('1D')

  return (
    <div className="border-2 border-[#2D0A5B] p-6 h-full flex flex-col bg-[#0A0A0A]">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A1A1A1] mb-2">Price</p>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-2xl font-bold uppercase tracking-tight text-[#F2F2F2]">DOT / USDC</h3>
            <span className="px-2 py-1 border border-[#00D084] text-[#00D084] text-xs font-bold uppercase flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +5.24%
            </span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-[#F2F2F2]">
            4.20 <span className="text-lg text-[#A1A1A1]">USDC</span>
          </div>
          <div className="text-[#A1A1A1] text-xs font-bold uppercase tracking-[0.2em] mt-1">Past 24 Hours</div>
        </div>
        <div className="flex gap-1">
          {['1H', '1D', '1W', '1M', '1Y'].map(tf => (
            <button
              key={tf}
              onClick={() => setActivePeriod(tf)}
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
                activePeriod === tf
                  ? 'bg-[#7B3FE4] text-[#F2F2F2]'
                  : 'text-[#A1A1A1] hover:text-[#F2F2F2] border border-transparent hover:border-[#2D0A5B]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[300px] border-b border-[#2D0A5B]/50 relative flex items-end justify-between px-2 pb-4 group">
        <div className="absolute inset-0 flex items-center justify-center text-[#2D0A5B]/30 pointer-events-none">
          <BarChart3 className="w-24 h-24" />
        </div>
        {[30, 45, 40, 60, 50, 65, 55, 75, 70, 90, 85, 100].map((h, i) => (
          <div
            key={i}
            className="w-[6%] bg-[#7B3FE4]/30 group-hover:bg-[#7B3FE4]/60 transition-colors border-t border-[#7B3FE4] relative group/bar cursor-crosshair"
            style={{ height: `${h}%` }}
          >
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-[#0A0A0A] border border-[#2D0A5B] text-xs px-2 py-1 text-[#F2F2F2] opacity-0 group-hover/bar:opacity-100 transition-opacity font-bold whitespace-nowrap z-10 pointer-events-none">
              {(4.0 + (h / 100) * 0.4).toFixed(3)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-[#A1A1A1] text-xs mt-4 font-bold px-2">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  )
}
