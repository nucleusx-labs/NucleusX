import { BarChart3, TrendingUp } from 'lucide-react'

export default function PriceChart() {
  return (
    <div className="glass-panel rounded-[2rem] p-6 h-full flex flex-col shadow-2xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-slate-200">DOT / USDC</h3>
            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-sm font-bold rounded-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +5.24%
            </span>
          </div>
          <div className="text-4xl font-mono font-bold text-white mb-1">
            4.20 <span className="text-xl text-slate-500">USDC</span>
          </div>
          <div className="text-slate-400 text-sm">Past 24 Hours</div>
        </div>
        <div className="flex gap-2">
          {['1H', '1D', '1W', '1M', '1Y'].map(tf => (
            <button key={tf} className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${tf === '1D' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      {/* Mocked Chart Area */}
      <div className="flex-1 min-h-[300px] border-b border-indigo-500/10 relative flex items-end justify-between px-2 sm:px-4 pb-4 group">
        <div className="absolute inset-0 flex items-center justify-center text-slate-700/50 pointer-events-none">
          <BarChart3 className="w-32 h-32" />
        </div>
        {/* Mocking bars */}
        {[30, 45, 40, 60, 50, 65, 55, 75, 70, 90, 85, 100].map((h, i) => (
          <div 
            key={i} 
            className="w-[6%] bg-gradient-to-t from-indigo-500/10 to-indigo-400/30 group-hover:to-indigo-400/50 transition-colors rounded-t-md relative group/bar cursor-crosshair" 
            style={{ height: `${h}%` }}
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity font-mono whitespace-nowrap z-10 pointer-events-none">
              {(4.0 + (h / 100) * 0.4).toFixed(3)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between text-slate-500 text-xs sm:text-sm mt-4 font-mono px-4">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  )
}
