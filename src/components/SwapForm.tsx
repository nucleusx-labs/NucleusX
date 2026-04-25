import { useAtom, useSelector } from '@xstate/store/react'
import { ArrowDown, Loader2, Settings } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { selectedAccount } from '../hooks/useConnect'
import { useSwap } from '../hooks/useSwap'
import { useTokenBalances } from '../hooks/useTokenBalances'
import SettingsModal from './SettingsModal'
import { dexStore, NATIVE_TOKEN_ADDRESS, selectTokenList } from '../store/dexStore'
import type { Token } from '../store/dexStore'
import TokenSelector from './TokenSelector'

// Reserve a small amount of native QF so "Max" doesn't leave the account
// without gas to sign the swap.
const NATIVE_GAS_RESERVE = 10_000_000_000_000_000n // 0.01 QF

function formatAmount(raw: bigint, decimals: number): string {
  if (raw <= 0n) return ''
  const divisor = 10n ** BigInt(decimals)
  const whole = raw / divisor
  const frac = (raw % divisor).toString().padStart(decimals, '0').slice(0, 6).replace(/0+$/, '')
  return frac ? `${whole}.${frac}` : whole.toString()
}

export default function SwapForm() {
  const account = useAtom(selectedAccount)
  const tokenList = useSelector(dexStore, selectTokenList)

  const [payAmount, setPayAmount] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('')
  const [payToken, setPayToken] = useState<Token | undefined>()
  const [receiveToken, setReceiveToken] = useState<Token | undefined>()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    if (payToken || tokenList.length === 0) return
    const wqf = tokenList.find(token => token.symbol === 'WQF')
    if (wqf) setPayToken(wqf)
  }, [payToken, tokenList])

  const { quote, isQuoting, isCheckingAllowance, isApproving, isSwapping, txHash, error, evmAddress, fetchQuote, swap, clearError } = useSwap()

  const balances = useTokenBalances(
    evmAddress,
    tokenList.map(t => t.address),
    account?.address,
  )

  const quoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current)

    if (!payAmount || !payToken || !receiveToken || payAmount === '0') {
      setReceiveAmount('')
      return
    }

    quoteTimerRef.current = setTimeout(() => {
      const inDecimals = payToken.decimals
      const amountIn = BigInt(Math.floor(Number(payAmount) * 10 ** inDecimals))
      if (amountIn > 0n) {
        fetchQuote(amountIn, payToken, receiveToken)
      }
    }, 400)

    return () => {
      if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current)
    }
  }, [payAmount, payToken?.address, receiveToken?.address])

  useEffect(() => {
    if (quote) {
      setReceiveAmount(quote.amountOutFormatted)
    }
    else if (!isQuoting) {
      setReceiveAmount('')
    }
  }, [quote, isQuoting])

  const handleSwapTokens = () => {
    const tempAmt = payAmount
    setPayAmount(receiveAmount)
    setReceiveAmount(tempAmt)
    const tempToken = payToken
    setPayToken(receiveToken)
    setReceiveToken(tempToken)
  }

  const handleSwap = () => {
    if (!payToken || !receiveToken || !payAmount) return
    clearError()
    swap()
  }

  const payBalance = payToken ? balances.get(payToken.address.toLowerCase()) : undefined

  const amountInRaw = useMemo(() => {
    if (!payAmount || !payToken) return 0n
    const n = Number(payAmount)
    if (!Number.isFinite(n) || n <= 0) return 0n
    return BigInt(Math.floor(n * 10 ** payToken.decimals))
  }, [payAmount, payToken?.decimals])

  const hasInsufficientBalance
    = !!payToken && !!payBalance && amountInRaw > 0n && amountInRaw > payBalance.balance

  const setPercent = (pct: number) => {
    if (!payToken || !payBalance) return
    let raw = (payBalance.balance * BigInt(pct)) / 100n
    if (pct === 100 && payToken.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
      raw = raw > NATIVE_GAS_RESERVE ? raw - NATIVE_GAS_RESERVE : 0n
    }
    setPayAmount(formatAmount(raw, payToken.decimals))
  }

  const isProcessing = isCheckingAllowance || isApproving || isSwapping
  const canSwap
    = !!account
    && !!payToken
    && !!receiveToken
    && !!payAmount
    && !!quote
    && !isProcessing
    && !hasInsufficientBalance

  function getButtonLabel() {
    if (!account) return 'Connect Wallet'
    if (isCheckingAllowance) return 'Checking Allowance…'
    if (isApproving) return 'Approving…'
    if (isSwapping) return 'Swapping…'
    if (isQuoting) return 'Fetching Quote…'
    if (!payToken || !receiveToken) return 'Select Tokens'
    if (!payAmount) return 'Enter Amount'
    if (hasInsufficientBalance) return `Insufficient ${payToken.symbol}`
    if (error && !quote) {
      if (/no liquidity pool|no liquidity yet/i.test(error)) return 'No Pool Available'
      if (/too small/i.test(error)) return 'Amount Too Small'
      return 'Quote Unavailable'
    }
    if (!quote) return 'No Route Found'
    return 'Swap'
  }

  return (
    <div
      className="w-full max-w-md ncx-card-soft p-5 relative overflow-visible"
      style={{ boxShadow: 'var(--ncx-shadow-md)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-semibold text-ncx-text">Swap</h2>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full text-ncx-text-subtle hover:text-ncx-text hover:bg-ncx-wash transition-all duration-200"
          aria-label="Swap settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* ── Pay box ── */}
      <div
        className="rounded-2xl p-4 border transition-colors duration-200 focus-within:border-ncx-purple-400"
        style={{ background: 'var(--ncx-surface-2)', borderColor: 'var(--ncx-border)' }}
      >
        <div className="flex justify-between mb-2 ncx-num text-[10px] uppercase tracking-[0.12em] text-ncx-text-muted">
          <span>You pay</span>
          {payToken && (
            <span>Balance: {balances.get(payToken.address.toLowerCase())?.formatted ?? '—'}</span>
          )}
        </div>
        <div className="flex justify-between items-center gap-3">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            className="bg-transparent ncx-num text-3xl font-medium text-ncx-text focus:outline-none placeholder:text-ncx-text-subtle/50 w-full min-w-0 tracking-tight"
            value={payAmount}
            onChange={e => setPayAmount(e.target.value)}
          />
          <div className="shrink-0">
            <TokenSelector selectedToken={payToken} onSelectToken={setPayToken} balances={balances} />
          </div>
        </div>
        {payToken && payBalance && payBalance.balance > 0n && (
          <div className="flex gap-1.5 mt-3">
            {[10, 25, 50, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => setPercent(pct)}
                className="flex-1 py-1.5 rounded-full ncx-num text-[10px] uppercase tracking-[0.1em] text-ncx-text-muted border transition-all duration-200 hover:text-ncx-purple-300 hover:bg-ncx-wash"
                style={{ background: 'var(--ncx-surface-3)', borderColor: 'var(--ncx-border)' }}
              >
                {pct === 100 ? 'Max' : `${pct}%`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Flip ── */}
      <div className="flex justify-center -my-2.5 relative z-10">
        <button
          onClick={handleSwapTokens}
          aria-label="Flip tokens"
          className="w-10 h-10 rounded-full grid place-items-center transition-all duration-200 group"
          style={{
            background: 'var(--ncx-surface-3)',
            border: '3px solid var(--ncx-surface)',
            color: 'var(--ncx-purple-300)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--ncx-purple-500)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--ncx-surface-3)'
            e.currentTarget.style.color = 'var(--ncx-purple-300)'
          }}
        >
          <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
        </button>
      </div>

      {/* ── Receive box ── */}
      <div
        className="rounded-2xl p-4 border"
        style={{ background: 'var(--ncx-surface-2)', borderColor: 'var(--ncx-border)' }}
      >
        <div className="flex justify-between mb-2 ncx-num text-[10px] uppercase tracking-[0.12em] text-ncx-text-muted">
          <span>You receive</span>
          {receiveToken && (
            <span>Balance: {balances.get(receiveToken.address.toLowerCase())?.formatted ?? '—'}</span>
          )}
        </div>
        <div className="flex justify-between items-center gap-3">
          <div className="relative w-full min-w-0">
            <input
              type="text"
              placeholder="0.0"
              className="bg-transparent ncx-num text-3xl font-medium text-ncx-text focus:outline-none placeholder:text-ncx-text-subtle/50 w-full tracking-tight"
              value={receiveAmount}
              readOnly
            />
            {isQuoting && (
              <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-ncx-purple-300 animate-spin" />
            )}
          </div>
          <div className="shrink-0">
            <TokenSelector selectedToken={receiveToken} onSelectToken={setReceiveToken} balances={balances} />
          </div>
        </div>
      </div>

      {/* ── Quote info footer ── */}
      {quote && payToken && receiveToken && (
        <div
          className="mt-3 p-3 rounded-2xl text-[12px] leading-relaxed text-ncx-text-muted"
          style={{ background: 'var(--ncx-wash)' }}
        >
          <div className="flex justify-between py-0.5">
            <span>Min received · slippage</span>
            <span className="ncx-num text-ncx-text">
              {(Number(quote.amountOutMin) / 10 ** receiveToken.decimals).toFixed(6)} {receiveToken.symbol}
            </span>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <button
        onClick={handleSwap}
        disabled={!canSwap}
        className="btn-ncx btn-ncx-primary w-full mt-3.5"
        style={{ padding: '0.95rem 1.25rem', fontSize: '0.9375rem' }}
      >
        {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
        {getButtonLabel()}
      </button>

      {/* ── Error ── */}
      {error && (
        <div
          className="mt-3 p-3 rounded-2xl text-xs"
          style={{ background: 'var(--ncx-loss-bg)', color: 'var(--ncx-loss)', border: '1px solid color-mix(in srgb, var(--ncx-loss) 30%, transparent)' }}
        >
          {error}
        </div>
      )}

      {/* ── Success ── */}
      {txHash && !isProcessing && (
        <div
          className="mt-3 p-3 rounded-2xl ncx-num text-[11px] break-all"
          style={{ background: 'var(--ncx-gain-bg)', color: 'var(--ncx-gain)', border: '1px solid color-mix(in srgb, var(--ncx-gain) 30%, transparent)' }}
        >
          Tx: {txHash}
        </div>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
