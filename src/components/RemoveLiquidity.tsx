import { Loader2, Minus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { computeUnderlyingAmounts, formatTokenAmount, isHexAddress } from '../utils/liquidity'
import { useRemoveLiquidity } from '../hooks/useRemoveLiquidity'

interface RemoveLiquidityProps {
  pairAddress: string | null
}

export default function RemoveLiquidity({ pairAddress }: RemoveLiquidityProps) {
  const [percent, setPercent] = useState('50')
  const { position, step, txHash, error, remove, reset } = useRemoveLiquidity(pairAddress)

  const selectedPercent = Math.max(0, Math.min(100, Number(percent) || 0))
  const selectedLiquidity = useMemo(() => (
    position.userLiquidity > 0n
      ? (position.userLiquidity * BigInt(selectedPercent)) / 100n
      : 0n
  ), [position.userLiquidity, selectedPercent])

  const expectedAmounts = useMemo(() => computeUnderlyingAmounts(
    selectedLiquidity,
    position.totalSupply,
    position.reserve0,
    position.reserve1,
  ), [position.reserve0, position.reserve1, position.totalSupply, selectedLiquidity])

  const isProcessing = step === 'approving' || step === 'removing'
  const canRemove = !!position.pairAddress && selectedLiquidity > 0n && position.userLiquidity > 0n && !isProcessing
  const presets = ['25', '50', '75', '100']

  function getButtonLabel(): string {
    if (!pairAddress) return 'Missing Pair'
    if (!isHexAddress(pairAddress)) return 'Invalid Pair'
    if (position.isLoading) return 'Loading Position…'
    if (step === 'approving') return 'Approving LP Token…'
    if (step === 'removing') return 'Removing Liquidity…'
    if (position.userLiquidity === 0n) return 'No LP Position'
    if (selectedLiquidity === 0n) return 'Choose Amount'
    return 'Remove liquidity'
  }

  async function handleRemove() {
    await remove(selectedLiquidity)
  }

  return (
    <div className="space-y-3">
      {position.isLoading ? (
        <div className="rounded-2xl border border-ncx-border p-6 text-center text-ncx-text-muted">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3 text-ncx-purple-300" />
          Loading LP position…
        </div>
      ) : (
        <>
          {(position.token0 && position.token1) && (
            <p className="text-center text-ncx-text-muted ncx-num text-[11px] uppercase tracking-[0.18em] mb-1">
              {position.token0.symbol} · {position.token1.symbol}
            </p>
          )}

          <div
            className="rounded-2xl p-4 space-y-2.5"
            style={{ background: 'var(--ncx-wash)', border: '1px solid color-mix(in srgb, var(--ncx-purple-500) 20%, transparent)' }}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted">Your LP balance</span>
              <span className="ncx-num text-sm text-ncx-text">{formatTokenAmount(position.userLiquidity, 18)} LP</span>
            </div>
            {position.pairAddress && (
              <div className="ncx-num text-[11px] text-ncx-text-subtle break-all">
                Pair: {position.pairAddress}
              </div>
            )}
          </div>

          <div
            className="rounded-2xl p-5 border"
            style={{ background: 'var(--ncx-surface-2)', borderColor: 'var(--ncx-border)' }}
          >
            <p className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted mb-3">Amount to remove</p>
            <div className="ncx-num text-5xl font-medium tracking-tight text-ncx-text mb-3 text-center">{selectedPercent}%</div>
            <div className="ncx-num text-sm text-center text-ncx-text-muted mb-5">
              {formatTokenAmount(selectedLiquidity, 18)} LP
            </div>
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
              value={selectedPercent}
              onChange={e => setPercent(e.target.value)}
              className="w-full"
              style={{ accentColor: 'var(--ncx-purple-500)' }}
            />
          </div>

          <div
            className="rounded-2xl p-4 space-y-2.5"
            style={{ background: 'var(--ncx-wash)', border: '1px solid color-mix(in srgb, var(--ncx-purple-500) 20%, transparent)' }}
          >
            <p className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted">You will receive</p>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-ncx-text">{position.token0?.symbol ?? 'Token A'}</span>
              <span className="ncx-num text-ncx-text">
                {position.token0 ? formatTokenAmount(expectedAmounts.amount0, position.token0.decimals) : '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-ncx-text">{position.token1?.symbol ?? 'Token B'}</span>
              <span className="ncx-num text-ncx-text">
                {position.token1 ? formatTokenAmount(expectedAmounts.amount1, position.token1.decimals) : '0'}
              </span>
            </div>
          </div>

          <button className="btn-ncx btn-ncx-primary w-full mt-2" style={{ padding: '0.95rem 1.25rem', fontSize: '0.9375rem' }} onClick={handleRemove} disabled={!canRemove}>
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
            {!isProcessing && <Minus className="w-4 h-4" />}
            {getButtonLabel()}
          </button>
        </>
      )}

      {(position.error || error) && (
        <div
          className="p-3 rounded-2xl text-xs flex items-start justify-between gap-2"
          style={{ background: 'var(--ncx-loss-bg)', color: 'var(--ncx-loss)', border: '1px solid color-mix(in srgb, var(--ncx-loss) 30%, transparent)' }}
        >
          <span>{position.error ?? error}</span>
          <button onClick={reset} className="shrink-0 underline hover:no-underline">Dismiss</button>
        </div>
      )}

      {step === 'success' && txHash && (
        <div
          className="p-3 rounded-2xl ncx-num text-[11px] break-all"
          style={{ background: 'var(--ncx-gain-bg)', color: 'var(--ncx-gain)', border: '1px solid color-mix(in srgb, var(--ncx-gain) 30%, transparent)' }}
        >
          <div className="font-semibold mb-1">Liquidity removed</div>
          <div>{txHash}</div>
        </div>
      )}
    </div>
  )
}
