import { ArrowLeft, Minus } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { KNOWN_TOKENS } from '../components/TokenModal'

export default function RemoveLiquidity() {
  const [searchParams] = useSearchParams()
  const [percent, setPercent] = useState('50')
  const [tokenASymbol, setTokenASymbol] = useState('')
  const [tokenBSymbol, setTokenBSymbol] = useState('')

  useEffect(() => {
    const paramA = searchParams.get('tokenA')
    const paramB = searchParams.get('tokenB')
    if (paramA) { const f = KNOWN_TOKENS.find((t: { symbol: string }) => t.symbol === paramA); if (f) setTokenASymbol(f.symbol) }
    if (paramB) { const f = KNOWN_TOKENS.find((t: { symbol: string }) => t.symbol === paramB); if (f) setTokenBSymbol(f.symbol) }
  }, [searchParams])

  const presets = ['25', '50', '75', '100']

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8 w-full">
      <div className="w-full max-w-lg border-2 border-[#2D0A5B] p-8 relative">
        <Link to="/pools" className="absolute top-8 left-8 text-[#A1A1A1] hover:text-[#F2F2F2] transition-colors duration-150">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold uppercase tracking-widest text-center text-[#F2F2F2] mb-8">Remove Liquidity</h2>

        {(tokenASymbol || tokenBSymbol) && (
          <p className="text-center text-[#A1A1A1] text-sm font-bold uppercase tracking-widest mb-6">
            {tokenASymbol}/{tokenBSymbol}
          </p>
        )}

        <div className="space-y-6">
          {/* Percentage selector */}
          <div className="border border-[#2D0A5B] p-4">
            <p className="text-[#A1A1A1] text-xs font-bold uppercase tracking-[0.2em] mb-4">Amount to Remove</p>
            <div className="text-5xl font-bold tracking-tight text-[#F2F2F2] mb-6 text-center">{percent}%</div>
            <div className="flex gap-2">
              {presets.map(val => (
                <button
                  key={val}
                  onClick={() => setPercent(val)}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-150 ${
                    percent === val
                      ? 'bg-[#7B3FE4] text-[#F2F2F2]'
                      : 'border border-[#2D0A5B] text-[#A1A1A1] hover:bg-[#2D0A5B] hover:text-[#F2F2F2]'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className="w-full mt-4 accent-[#7B3FE4]"
            />
          </div>

          {/* Output estimate */}
          <div className="border border-[#2D0A5B] p-4 space-y-3">
            <p className="text-[#A1A1A1] text-xs font-bold uppercase tracking-[0.2em]">You Will Receive</p>
            <div className="flex justify-between items-center">
              <span className="font-bold uppercase text-[#F2F2F2]">{tokenASymbol || 'Token A'}</span>
              <span className="font-bold text-[#F2F2F2]">—</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold uppercase text-[#F2F2F2]">{tokenBSymbol || 'Token B'}</span>
              <span className="font-bold text-[#F2F2F2]">—</span>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 py-4 bg-[#7B3FE4] text-[#F2F2F2] text-sm font-bold uppercase tracking-widest hover:bg-[#2D0A5B] transition-colors duration-150">
            <Minus className="w-4 h-4" /> Remove Liquidity
          </button>
        </div>
      </div>
    </div>
  )
}
