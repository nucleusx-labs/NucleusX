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
    <div className="max-w-7xl mx-auto w-full py-8 space-y-10">

      {/* Page header */}
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A1A1A1] mb-2">Overview</p>
        <h1 className="text-5xl font-bold tracking-tighter text-[#F2F2F2]">Portfolio</h1>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Total Balance — hero metric */}
        <div className="border-2 border-[#2D0A5B] p-8 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-4 h-4 text-[#7B3FE4]" />
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">Total Balance</p>
          </div>
          <div className="flex items-baseline gap-4 mb-6">
            <div className="text-6xl font-bold tracking-tighter text-[#F2F2F2]">$5,768.90</div>
            <span className="text-xl font-bold text-[#00D084]">+2.4%</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#00D084] font-bold">
            <TrendingUp className="w-4 h-4" />
            <span>+$124.50 today</span>
          </div>
          {/* Allocation bar */}
          <div className="mt-6">
            <div className="flex h-1.5 border border-[#2D0A5B] overflow-hidden">
              <div className="h-full bg-[#7B3FE4]" style={{ width: '71.4%' }} />
              <div className="h-full bg-[#00D084]" style={{ width: '18.2%' }} />
              <div className="h-full bg-[#A1A1A1]" style={{ width: '10.4%' }} />
            </div>
            <div className="flex items-center gap-6 mt-2">
              {[{ label: 'WETH', color: 'bg-[#7B3FE4]' }, { label: 'USDC', color: 'bg-[#00D084]' }, { label: 'DOT', color: 'bg-[#A1A1A1]' }].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-xs font-bold uppercase text-[#A1A1A1]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staked + CTAs */}
        <div className="border-2 border-[#2D0A5B] p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-[#7B3FE4]" />
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">Staked</p>
            </div>
            <div className="text-4xl font-bold tracking-tighter text-[#F2F2F2] mb-4">$1,234.56</div>
            <Link
              to="/staking"
              className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150"
            >
              View Staking <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex flex-col gap-2 mt-6">
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#7B3FE4] text-[#F2F2F2] text-sm font-bold uppercase tracking-widest hover:bg-[#2D0A5B] transition-colors duration-150">
              <Plus className="w-4 h-4" /> Deposit
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-3 border border-[#2D0A5B] text-[#A1A1A1] text-sm font-bold uppercase tracking-widest hover:bg-[#2D0A5B] hover:text-[#F2F2F2] transition-colors duration-150">
              <Minus className="w-4 h-4" /> Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Assets List */}
        <div className="border-2 border-[#2D0A5B] lg:col-span-1">
          <div className="flex items-center justify-between p-6 border-b border-[#2D0A5B]">
            <h3 className="text-base font-bold uppercase tracking-widest text-[#F2F2F2]">Your Assets</h3>
            <span className="text-xs text-[#A1A1A1] font-bold uppercase tracking-widest">{assets.length} tokens</span>
          </div>

          <div>
            {assets.map((asset, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-4 border-b border-[#2D0A5B]/50 last:border-b-0 hover:bg-[#2D0A5B] transition-colors duration-150 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#2D0A5B] flex items-center justify-center text-[#7B3FE4] font-bold text-sm">
                    {asset.symbol[0]}
                  </div>
                  <div>
                    <div className="font-bold uppercase text-[#F2F2F2] text-sm">{asset.symbol}</div>
                    <div className="text-xs text-[#A1A1A1]">{asset.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#F2F2F2] text-sm">{asset.value}</div>
                  <div className={`text-xs font-bold ${asset.change.startsWith('+') ? 'text-[#00D084]' : asset.change.startsWith('-') ? 'text-[#FF4040]' : 'text-[#A1A1A1]'}`}>
                    {asset.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Allocation bar */}
          <div className="px-6 py-4 border-t border-[#2D0A5B]">
            <div className="flex h-1 overflow-hidden">
              {assets.map((asset, i) => (
                <div
                  key={i}
                  className={i === 2 ? 'bg-[#7B3FE4]' : i === 1 ? 'bg-[#00D084]' : 'bg-[#A1A1A1]'}
                  style={{ width: `${asset.pct}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="border-2 border-[#2D0A5B] lg:col-span-2">
          <div className="flex items-center justify-between p-6 border-b border-[#2D0A5B]">
            <h3 className="text-base font-bold uppercase tracking-widest text-[#F2F2F2] flex items-center gap-2">
              <History className="w-4 h-4 text-[#7B3FE4]" /> Recent History
            </h3>
            <button className="text-xs font-bold uppercase tracking-widest text-[#A1A1A1] hover:text-[#F2F2F2] transition-colors duration-150">
              View All
            </button>
          </div>

          <ul className="divide-y divide-[#2D0A5B]/50">
            {transactions.map((tx, i) => (
              <li key={i} className="grid grid-cols-12 gap-4 items-center px-6 py-4 text-sm hover:bg-[#2D0A5B] transition-colors duration-150">
                <div className="col-span-1 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#00D084]" />
                </div>
                <div className="col-span-3">
                  <span className="font-bold uppercase text-[#F2F2F2] tracking-wider">{tx.type}</span>
                </div>
                <div className="col-span-5 text-[#A1A1A1] truncate">{tx.details}</div>
                <div className="col-span-3 text-right text-[#A1A1A1]">{tx.time}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
