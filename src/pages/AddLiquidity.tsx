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
    if (paramA) { const f = MOCK_TOKENS.find(t => t.symbol === paramA); if (f) setTokenA(f) }
    if (paramB) { const f = MOCK_TOKENS.find(t => t.symbol === paramB); if (f) setTokenB(f) }
  }, [searchParams])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8 w-full px-4">
      <div className="w-full max-w-lg panel-brutal p-6 relative">
        <div className="noise-overlay opacity-20"></div>
        <Link to="/pools" className="absolute top-6 left-6 z-10 border-[2px] border-transparent hover:border-black text-brutalist-text-muted hover:text-brutalist-panel-text p-1 transition-all duration-75">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-2xl font-black uppercase tracking-tight text-center text-brutalist-panel-text mb-8 relative z-10">Add Liquidity</h2>

        <div className="space-y-4 relative z-10">
          <div className="input-container-brutal">
            <div className="flex justify-between mb-2">
              <span className="text-brutalist-text-muted text-xs font-black uppercase tracking-widest">Deposit Amount</span>
              {tokenA?.balance && <span className="text-brutalist-text-muted text-xs font-mono">Balance: {tokenA.balance}</span>}
            </div>
            <div className="flex justify-between items-center gap-4">
              <input type="text" placeholder="0.0" className="input-brutal" value={amountA} onChange={(e) => setAmountA(e.target.value)} />
              <TokenSelector selectedToken={tokenA} onSelectToken={setTokenA} />
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <div className="bg-brutalist-accent border-[3px] border-black p-2 text-black shadow-[3px_3px_0_#000]">
              <Plus className="w-5 h-5" />
            </div>
          </div>

          <div className="input-container-brutal">
            <div className="flex justify-between mb-2">
              <span className="text-brutalist-text-muted text-xs font-black uppercase tracking-widest">Deposit Amount</span>
              {tokenB?.balance && <span className="text-brutalist-text-muted text-xs font-mono">Balance: {tokenB.balance}</span>}
            </div>
            <div className="flex justify-between items-center gap-4">
              <input type="text" placeholder="0.0" className="input-brutal" value={amountB} onChange={(e) => setAmountB(e.target.value)} />
              <TokenSelector selectedToken={tokenB} onSelectToken={setTokenB} />
            </div>
          </div>

          <div className="pt-4">
            <button className="btn-brutal w-full text-lg">Supply</button>
          </div>
        </div>
      </div>
    </div>
  )
}
