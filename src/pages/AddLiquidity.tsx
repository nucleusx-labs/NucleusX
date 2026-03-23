import { ArrowLeft, Plus } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import TokenSelector from '../components/TokenSelector'
import type { Token } from '../components/TokenModal'
import { MOCK_TOKENS } from '../components/TokenModal'

export default function AddLiquidity() {
  const [searchParams] = useSearchParams()
  const [tokenA, setTokenA] = useState<Token | undefined>()
  const [tokenB, setTokenB] = useState<Token | undefined>()
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')

  useEffect(() => {
    const paramA = searchParams.get('tokenA')
    const paramB = searchParams.get('tokenB')
    
    if (paramA) {
      const foundA = MOCK_TOKENS.find(t => t.symbol === paramA)
      if (foundA) setTokenA(foundA)
    }
    if (paramB) {
      const foundB = MOCK_TOKENS.find(t => t.symbol === paramB)
      if (foundB) setTokenB(foundB)
    }
  }, [searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8 w-full">
      <div className="w-full max-w-lg glass-panel rounded-[2rem] p-6 shadow-2xl relative">
        <Link to="/pools" className="absolute top-6 left-6 text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-2xl font-bold text-center text-slate-200 mb-8">Add Liquidity</h2>
        
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-4 hover:border-white/10 transition-colors focus-within:border-indigo-500/50">
            <div className="flex justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Deposit Amount</span>
              {tokenA?.balance && <span className="text-slate-500 text-sm font-mono">Balance: {tokenA.balance}</span>}
            </div>
            <div className="flex justify-between items-center gap-4">
              <input 
                type="text" placeholder="0.0"
                className="w-full bg-transparent text-3xl font-mono text-slate-200 focus:outline-none placeholder:text-slate-600"
                value={amountA} onChange={(e) => setAmountA(e.target.value)}
              />
              <TokenSelector selectedToken={tokenA} onSelectToken={setTokenA} />
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <div className="bg-slate-800 border-4 border-slate-950 p-2 rounded-xl text-slate-400">
               <Plus className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-4 hover:border-white/10 transition-colors focus-within:border-indigo-500/50">
            <div className="flex justify-between mb-2">
               <span className="text-slate-400 text-sm font-medium">Deposit Amount</span>
               {tokenB?.balance && <span className="text-slate-500 text-sm font-mono">Balance: {tokenB.balance}</span>}
            </div>
            <div className="flex justify-between items-center gap-4">
              <input 
                type="text" placeholder="0.0"
                className="w-full bg-transparent text-3xl font-mono text-slate-200 focus:outline-none placeholder:text-slate-600"
                value={amountB} onChange={(e) => setAmountB(e.target.value)}
              />
              <TokenSelector selectedToken={tokenB} onSelectToken={setTokenB} />
            </div>
          </div>

          <div className="pt-4">
             <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]">
               Supply
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}