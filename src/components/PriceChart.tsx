import { BarChart3, TrendingUp } from 'lucide-react'

export default function PriceChart() {
  return (
    <div className="panel-brutal-dark p-6 h-full flex flex-col">
      <div className="noise-overlay opacity-20 invert"></div>
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-black uppercase tracking-tight text-brutalist-text">DOT / USDC</h3>
            {/* Orange for live price trend badge */}
            <span className="px-2 py-1 bg-brutalist-orange text-black text-xs font-black uppercase border-[2px] border-black shadow-[2px_2px_0_#000] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +5.24%
            </span>
          </div>
          <div className="text-4xl font-mono font-black text-brutalist-text mb-1">
            4.20 <span className="text-xl text-brutalist-text-muted">USDC</span>
          </div>
          <div className="text-brutalist-text-muted text-xs font-black uppercase tracking-widest">Past 24 Hours</div>
        </div>
        <div className="flex gap-1">
          {['1H', '1D', '1W', '1M', '1Y'].map(tf => (
            <button key={tf} className={`px-3 py-1 text-xs font-black uppercase tracking-wider border-[2px] transition-all duration-75 ${tf === '1D' ? 'border-brutalist-teal bg-brutalist-teal text-black shadow-[2px_2px_0_#000]' : 'border-transparent text-brutalist-text-muted hover:border-brutalist-text-muted hover:text-brutalist-text'}`}>
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Mocked Chart Area — teal bars */}
      <div className="flex-1 min-h-[300px] border-b-[3px] border-brutalist-text-muted/30 relative flex items-end justify-between px-2 sm:px-4 pb-4 group z-10">
        <div className="absolute inset-0 flex items-center justify-center text-brutalist-text-muted/20 pointer-events-none">
          <BarChart3 className="w-32 h-32" />
        </div>
        {[30, 45, 40, 60, 50, 65, 55, 75, 70, 90, 85, 100].map((h, i) => (
          <div
            key={i}
            className="w-[6%] bg-brutalist-teal/40 group-hover:bg-brutalist-teal/70 transition-colors border-t-[2px] border-brutalist-teal relative group/bar cursor-crosshair"
            style={{ height: `${h}%` }}
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black border-[2px] border-brutalist-text-muted text-xs px-2 py-1 text-brutalist-text opacity-0 group-hover/bar:opacity-100 transition-opacity font-mono whitespace-nowrap z-10 pointer-events-none">
              {(4.0 + (h / 100) * 0.4).toFixed(3)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-brutalist-text-muted text-xs sm:text-sm mt-4 font-mono font-bold px-4 relative z-10">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  )
}
