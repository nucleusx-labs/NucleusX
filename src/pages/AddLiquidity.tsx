import { ArrowLeft, Plus } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import TokenSelector from '../components/TokenSelector'
import type { Token } from '../store/dexStore'
import { useSelector } from '@xstate/store/react'
import { dexStore, selectTokenList } from '../store/dexStore'

export default function AddLiquidity() {
  const [searchParams] = useSearchParams()
  const [tokenA, setTokenA] = useState<Token | undefined>()
  const [tokenB, setTokenB] = useState<Token | undefined>()
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const tokenList = useSelector(dexStore, selectTokenList)

  useEffect(() => {
    const paramA = searchParams.get('tokenA')
    const paramB = searchParams.get('tokenB')
    if (paramA) { const f = tokenList.find(t => t.symbol === paramA); if (f) setTokenA(f) }
    if (paramB) { const f = tokenList.find(t => t.symbol === paramB); if (f) setTokenB(f) }
  }, [searchParams, tokenList])

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8 w-full">
      <div className="w-full max-w-lg border-2 border-[#2D0A5B] p-8 relative">
        <Link to="/pools" className="absolute top-8 left-8 text-[#A1A1A1] hover:text-[#F2F2F2] transition-colors duration-150">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold uppercase tracking-widest text-center text-[#F2F2F2] mb-8">Add Liquidity</h2>

        <div className="space-y-4">
          <div className="border border-[#2D0A5B] p-4">
            <div className="flex justify-between mb-3">
              <span className="text-[#A1A1A1] text-xs font-bold uppercase tracking-[0.2em]">Deposit Amount</span>
              {tokenA && <span className="text-[#A1A1A1] text-xs font-bold">{tokenA.symbol}</span>}
            </div>
            <div className="flex justify-between items-center gap-4">
              <input
                type="text"
                placeholder="0.0"
                className="bg-transparent text-2xl font-bold text-[#F2F2F2] focus:outline-none placeholder:text-[#A1A1A1]/30 w-full"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
              />
              <TokenSelector selectedToken={tokenA} onSelectToken={setTokenA} />
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <div className="bg-[#2D0A5B] p-2 text-[#7B3FE4]">
              <Plus className="w-4 h-4" />
            </div>
          </div>

          <div className="border border-[#2D0A5B] p-4">
            <div className="flex justify-between mb-3">
              <span className="text-[#A1A1A1] text-xs font-bold uppercase tracking-[0.2em]">Deposit Amount</span>
              {tokenB && <span className="text-[#A1A1A1] text-xs font-bold">{tokenB.symbol}</span>}
            </div>
            <div className="flex justify-between items-center gap-4">
              <input
                type="text"
                placeholder="0.0"
                className="bg-transparent text-2xl font-bold text-[#F2F2F2] focus:outline-none placeholder:text-[#A1A1A1]/30 w-full"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
              />
              <TokenSelector selectedToken={tokenB} onSelectToken={setTokenB} />
            </div>
          </div>

          <div className="pt-4">
            <button className="w-full py-4 bg-[#7B3FE4] text-[#F2F2F2] text-sm font-bold uppercase tracking-widest hover:bg-[#2D0A5B] transition-colors duration-150">
              Supply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
