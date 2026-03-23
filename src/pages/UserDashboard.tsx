import { Wallet, TrendingUp, History, ArrowUpRight, Target, Plus, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function UserDashboard() {
  const assets = [
    { symbol: 'DOT', name: 'Polkadot', balance: '142.5', value: '$598.50', change: '+2.4%', pct: 10.4 },
    { symbol: 'USDC', name: 'USD Coin', balance: '1,050.00', value: '$1,050.00', change: '0.0%', pct: 18.2 },
    { symbol: 'WETH', name: 'Wrapped Ether', balance: '1.24', value: '$4,120.40', change: '-1.2%', pct: 71.4 },
  ]

  const transactions = [
    { type: 'Swap', details: 'Swapped 100 USDC for 23.8 DOT', time: '2 hours ago', status: 'Completed' },
    { type: 'Liquidity', details: 'Added 50 USDC and 11.9 DOT', time: '1 day ago', status: 'Completed' },
    { type: 'Swap', details: 'Swapped 0.5 WETH for 1660 USDC', time: '3 days ago', status: 'Completed' },
  ]

  return (
    <div className="max-w-7xl mx-auto w-full py-8 space-y-8 px-4">

      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-brutalist-text-muted font-black uppercase text-xs tracking-widest mb-1">Overview</div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-brutalist-text">Portfolio</h1>
        </div>
      </div>

      {/* Overview Cards — Balance spans 2 cols, Staked+CTAs in 3rd */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Balance — hero metric, 2 cols wide */}
        <div className="bento-box p-8 relative overflow-hidden group lg:col-span-2">
          <div className="noise-overlay opacity-20"></div>
          <h2 className="text-brutalist-text-muted font-black uppercase text-xs tracking-widest mb-2 flex items-center gap-2 relative z-10">
            <Wallet className="w-5 h-5" /> Total Balance
          </h2>
          <div className="text-5xl sm:text-7xl font-black text-brutalist-panel-text mb-6 tracking-tighter relative z-10">
            $5,768<span className="text-brutalist-text-muted">.90</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 relative z-10">
            {/* Orange for today's gain badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brutalist-orange border-[2px] border-black text-black font-black text-xs uppercase tracking-widest shadow-[2px_2px_0_#000]">
              <TrendingUp className="w-4 h-4" /> +$124.50 (2.4%) Today
            </div>
            {/* Mini portfolio allocation bar */}
            <div className="flex-1 min-w-32 hidden sm:flex flex-col gap-1">
              <div className="flex h-2.5 border-[2px] border-black overflow-hidden">
                <div className="h-full bg-brutalist-accent" style={{ width: '71.4%' }} />
                <div className="h-full bg-brutalist-teal" style={{ width: '18.2%' }} />
                <div className="h-full bg-brutalist-orange" style={{ width: '10.4%' }} />
              </div>
              <div className="flex items-center gap-3">
                {[{ label: 'WETH', color: 'bg-brutalist-accent' }, { label: 'USDC', color: 'bg-brutalist-teal' }, { label: 'DOT', color: 'bg-brutalist-orange' }].map(({ label, color }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className={`w-2 h-2 border border-black ${color}`} />
                    <span className="text-[10px] font-black uppercase text-brutalist-text-muted">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Staked + CTAs combined — no more sparse button-only card */}
        <div className="bento-box p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="noise-overlay opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-brutalist-text-muted font-black uppercase text-xs tracking-widest mb-2 flex items-center gap-2">
              <Target className="w-5 h-5" /> Staked
            </h2>
            <div className="text-4xl sm:text-5xl font-black text-brutalist-panel-text mb-3 tracking-tighter">
              $1,234<span className="text-brutalist-text-muted">.56</span>
            </div>
            <Link
              to="/staking"
              className="inline-flex items-center gap-2 px-3 py-1 bg-black border-[2px] border-black text-brutalist-text font-black text-xs uppercase tracking-widest shadow-[2px_2px_0_var(--brutalist-accent)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75"
            >
              View Staking
            </Link>
          </div>
          <div className="relative z-10 flex flex-col gap-2 mt-6">
            <button className="btn-brutal w-full flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Deposit
            </button>
            <button className="w-full py-2.5 border-[3px] border-black bg-brutalist-panel text-brutalist-panel-text font-black uppercase hover:bg-black hover:text-brutalist-text transition-all duration-75 text-sm flex items-center justify-center gap-2">
              <Minus className="w-4 h-4" /> Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Assets List */}
        <div className="panel-brutal p-6 flex flex-col lg:col-span-1">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-brutalist-panel-text">Your Assets</h3>
            <span className="text-xs text-brutalist-text-muted font-black uppercase tracking-widest">{assets.length} tokens</span>
          </div>

          <div className="space-y-1 flex-grow">
            {assets.map((asset, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border-[2px] border-transparent hover:border-black hover:bg-black/[0.04] transition-all duration-75 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  {/* Purple for asset icon */}
                  <div className="w-10 h-10 bg-brutalist-accent border-[2px] border-black flex items-center justify-center font-black text-black text-sm shadow-[2px_2px_0_#000] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all duration-75 flex-shrink-0">
                    {asset.symbol[0]}
                  </div>
                  <div>
                    <div className="font-black uppercase text-brutalist-panel-text">{asset.symbol}</div>
                    <div className="text-xs text-brutalist-text-muted font-bold uppercase tracking-wider">{asset.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-brutalist-panel-text">{asset.value}</div>
                  <div className="text-xs font-mono flex items-center gap-1 justify-end">
                    <span className={asset.change.startsWith('+') ? 'text-brutalist-teal font-black' : asset.change.startsWith('-') ? 'text-red-500 font-black' : 'text-brutalist-text-muted'}>
                      {asset.change}
                    </span>
                    <span className="text-brutalist-text-muted">{asset.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Portfolio allocation bar */}
          <div className="mt-5 px-2">
            <div className="flex h-2 border-[2px] border-black overflow-hidden">
              {assets.map((asset, i) => (
                <div
                  key={i}
                  className={i === 2 ? 'bg-brutalist-accent' : i === 1 ? 'bg-brutalist-teal' : 'bg-brutalist-orange'}
                  style={{ width: `${asset.pct}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="panel-brutal p-6 flex flex-col lg:col-span-2">
          <div className="flex items-center justify-between mb-6 px-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-brutalist-panel-text flex items-center gap-2">
              {/* Orange for history icon */}
              <History className="w-5 h-5 text-brutalist-orange" /> Recent History
            </h3>
            <button className="text-xs font-black uppercase tracking-widest text-brutalist-text-muted hover:text-brutalist-panel-text border-[2px] border-transparent hover:border-black px-3 py-1 transition-all duration-75">
              View All
            </button>
          </div>

          <div className="space-y-2 flex-grow">
            {transactions.map((tx, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 border-[2px] border-black hover:bg-black/[0.04] transition-all duration-75 group"
              >
                {/* Purple for swap, teal for liquidity */}
                <div className={`p-3 flex-shrink-0 border-[2px] border-black ${tx.type === 'Swap' ? 'bg-brutalist-accent text-black' : 'bg-brutalist-teal text-black'}`}>
                  {tx.type === 'Swap' ? <ArrowUpRight className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-brutalist-panel-text truncate">{tx.details}</div>
                  <div className="text-xs text-brutalist-text-muted font-bold uppercase tracking-wider">{tx.time}</div>
                </div>
                {/* Teal for completed status */}
                <div className="text-xs font-black uppercase tracking-widest text-black bg-brutalist-teal border-[2px] border-black px-3 py-1 shadow-[2px_2px_0_#000] flex-shrink-0">
                  {tx.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
