import { Wallet, TrendingUp, History, ArrowUpRight, Target } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function UserDashboard() {
  const assets = [
    { symbol: 'DOT', name: 'Polkadot', balance: '142.5', value: '$598.50', change: '+2.4%' },
    { symbol: 'USDC', name: 'USD Coin', balance: '1,050.00', value: '$1,050.00', change: '0.0%' },
    { symbol: 'WETH', name: 'Wrapped Ether', balance: '1.24', value: '$4,120.40', change: '-1.2%' },
  ]
  
  const transactions = [
    { type: 'Swap', details: 'Swapped 100 USDC for 23.8 DOT', time: '2 hours ago', status: 'Completed' },
    { type: 'Liquidity', details: 'Added 50 USDC and 11.9 DOT', time: '1 day ago', status: 'Completed' },
    { type: 'Swap', details: 'Swapped 0.5 WETH for 1660 USDC', time: '3 days ago', status: 'Completed' },
  ]

  return (
    <div className="max-w-7xl mx-auto w-full py-8 space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-8 rounded-[2rem] shadow-2xl col-span-1 lg:col-span-1 relative overflow-hidden group">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-700" />
          <h2 className="text-slate-400 font-medium mb-2 flex items-center gap-2">
            <Wallet className="w-5 h-5" /> Total Balance
          </h2>
          <div className="text-5xl sm:text-7xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">$5,768.90</div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-bold text-sm shadow-inner shadow-green-500/10">
            <TrendingUp className="w-4 h-4" /> +$124.50 (2.4%) Today
          </div>
        </div>
        
        <div className="glass-panel p-8 rounded-[2rem] shadow-2xl col-span-1 lg:col-span-1 relative overflow-hidden group">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors duration-700" />
          <h2 className="text-slate-400 font-medium mb-2 flex items-center gap-2">
            <Target className="w-5 h-5" /> Staked
          </h2>
          <div className="text-5xl sm:text-7xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">$1,234.56</div>
          <Link to="/staking" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl font-bold text-sm shadow-inner shadow-purple-500/10">
            View Staking
          </Link>
        </div>

        <div className="glass-panel p-8 rounded-[2rem] shadow-2xl flex flex-col justify-center gap-4">
           <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1">
             Deposit Funds
           </button>
           <button className="w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 font-bold text-lg rounded-2xl transition-all hover:-translate-y-1">
             Withdraw
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assets List */}
        <div className="glass-panel rounded-[2rem] p-6 shadow-2xl flex flex-col lg:col-span-1">
          <h3 className="text-xl font-bold text-slate-200 mb-6 px-2">Your Assets</h3>
          <div className="space-y-2 flex-grow">
            {assets.map((asset, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-pointer group">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
                     {asset.symbol[0]}
                   </div>
                   <div>
                     <div className="font-bold text-slate-200 group-hover:text-white transition-colors text-lg">{asset.symbol}</div>
                     <div className="text-sm text-slate-500">{asset.name}</div>
                   </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-200 text-lg">{asset.balance}</div>
                  <div className="text-sm text-slate-500">{asset.value} <span className={asset.change.startsWith('+') ? 'text-green-400' : asset.change.startsWith('-') ? 'text-red-400' : 'text-slate-500'}>{asset.change}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-panel rounded-[2rem] p-6 shadow-2xl flex flex-col lg:col-span-2">
           <div className="flex items-center justify-between mb-6 px-2">
             <h3 className="text-xl font-bold text-slate-200 flex items-center gap-2">
               <History className="w-5 h-5 text-indigo-400" /> Recent History
             </h3>
             <button className="text-sm text-indigo-400 hover:text-indigo-300 font-bold px-3 py-1 hover:bg-indigo-500/10 rounded-lg transition-colors">View All</button>
           </div>
           
           <div className="space-y-4 flex-grow">
             {transactions.map((tx, i) => (
               <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 hover:border-white/10 transition-colors group">
                 <div className={`p-3 rounded-2xl flex-shrink-0 shadow-lg ${tx.type === 'Swap' ? 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20' : 'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20'} transition-colors`}>
                   {tx.type === 'Swap' ? <ArrowUpRight className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="font-bold text-slate-200 truncate group-hover:text-white transition-colors">{tx.details}</div>
                   <div className="text-sm text-slate-500">{tx.time}</div>
                 </div>
                 <div className="text-sm font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-lg">
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