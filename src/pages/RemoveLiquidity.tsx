import { ArrowLeft, Minus } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useSelector } from '@xstate/store/react'
import { dexStore, selectTokenList } from '../store/dexStore'

export default function RemoveLiquidity() {
  const [searchParams] = useSearchParams()
  const [percent, setPercent] = useState('50')
  const [tokenASymbol, setTokenASymbol] = useState('')
  const [tokenBSymbol, setTokenBSymbol] = useState('')
  const tokenList = useSelector(dexStore, selectTokenList)

  useEffect(() => {
    const paramA = searchParams.get('tokenA')
    const paramB = searchParams.get('tokenB')
    if (paramA) { const f = tokenList.find(t => t.symbol === paramA); if (f) setTokenASymbol(f.symbol) }
    if (paramB) { const f = tokenList.find(t => t.symbol === paramB); if (f) setTokenBSymbol(f.symbol) }
  }, [searchParams, tokenList])

  const presets = ['25', '50', '75', '100']

  return (
    <div className="flex flex-col items-center min-h-[70vh] py-8 w-full">
      <div className="w-full max-w-lg ncx-card-soft p-7 relative" style={{ boxShadow: 'var(--ncx-shadow-md)' }}>
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/pools"
            aria-label="Back"
            className="p-2 rounded-full text-ncx-text-subtle hover:text-ncx-text hover:bg-ncx-wash transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h2 className="text-base font-semibold text-ncx-text">Remove liquidity</h2>
          <span className="w-8" />
        </div>

        {(tokenASymbol || tokenBSymbol) && (
          <p className="text-center text-ncx-text-muted ncx-num text-[11px] uppercase tracking-[0.18em] mb-5">
            {tokenASymbol} · {tokenBSymbol}
          </p>
        )}

        <div className="space-y-3">
          {/* Percentage selector */}
          <div
            className="rounded-2xl p-5 border"
            style={{ background: 'var(--ncx-surface-2)', borderColor: 'var(--ncx-border)' }}
          >
            <p className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted mb-3">Amount to remove</p>
            <div className="ncx-num text-5xl font-medium tracking-tight text-ncx-text mb-5 text-center">{percent}%</div>
            <div className="flex gap-1.5 mb-4">
              {presets.map(val => (
                <button
                  key={val}
                  onClick={() => setPercent(val)}
                  className={`flex-1 py-1.5 rounded-full ncx-num text-[10px] uppercase tracking-[0.1em] transition-all duration-200 ${
                    percent === val
                      ? 'bg-ncx-purple-500 text-white'
                      : 'border border-ncx-border text-ncx-text-muted hover:border-ncx-purple-500 hover:text-ncx-text hover:bg-ncx-wash'
                  }`}
                  style={percent !== val ? { background: 'var(--ncx-surface-3)' } : undefined}
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
              className="w-full"
              style={{ accentColor: 'var(--ncx-purple-500)' }}
            />
          </div>

          {/* Output estimate */}
          <div
            className="rounded-2xl p-4 space-y-2.5"
            style={{ background: 'var(--ncx-wash)', border: '1px solid color-mix(in srgb, var(--ncx-purple-500) 20%, transparent)' }}
          >
            <p className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted">You will receive</p>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-ncx-text">{tokenASymbol || 'Token A'}</span>
              <span className="ncx-num text-ncx-text">—</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-ncx-text">{tokenBSymbol || 'Token B'}</span>
              <span className="ncx-num text-ncx-text">—</span>
            </div>
          </div>

          <button className="btn-ncx btn-ncx-primary w-full mt-2" style={{ padding: '0.95rem 1.25rem', fontSize: '0.9375rem' }}>
            <Minus className="w-4 h-4" /> Remove liquidity
          </button>
        </div>
      </div>
    </div>
  )
}
