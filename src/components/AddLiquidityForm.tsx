import { useAtom, useSelector } from '@xstate/store/react'
import { Loader2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { parseUnits } from 'viem'
import { selectedAccount } from '../hooks/useConnect'
import { usePairDetails } from '../hooks/usePairDetails'
import { useTokenBalances } from '../hooks/useTokenBalances'
import { useAddLiquidity } from '../hooks/useAddLiquidity'
import { dexStore, selectTokenList, NATIVE_TOKEN_ADDRESS } from '../store/dexStore'
import { TOKENS } from '../utils/contracts'
import TokenSelector from './TokenSelector'
import type { Token } from '../store/dexStore'

const NATIVE_GAS_RESERVE = 10_000_000_000_000_000n // 0.01 QF

function formatAmount(raw: bigint, decimals: number): string {
  if (raw <= 0n) return ''
  const divisor = 10n ** BigInt(decimals)
  const whole = raw / divisor
  const frac = (raw % divisor).toString().padStart(decimals, '0').slice(0, 6).replace(/0+$/, '')
  return frac ? `${whole}.${frac}` : whole.toString()
}

function formatRatio(
  numerator: bigint,
  denominator: bigint,
  numeratorDecimals: number,
  denominatorDecimals: number,
): string {
  if (numerator === 0n || denominator === 0n) return '0'
  const precision = 6n
  const scaled = numerator
    * (10n ** BigInt(denominatorDecimals))
    * (10n ** precision)
    / (denominator * (10n ** BigInt(numeratorDecimals)))

  const whole = scaled / (10n ** precision)
  const fraction = (scaled % (10n ** precision)).toString().padStart(Number(precision), '0').replace(/0+$/, '')
  return fraction ? `${whole}.${fraction}` : whole.toString()
}

export default function AddLiquidityForm() {
  const account = useAtom(selectedAccount)
  const tokenList = useSelector(dexStore, selectTokenList)

  const [tokenA, setTokenA] = useState<Token | undefined>()
  const [tokenB, setTokenB] = useState<Token | undefined>()
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')

  const pair = usePairDetails(tokenA, tokenB)
  const { step, txHash, error, evmAddress, supply, reset } = useAddLiquidity()

  const [searchParams] = useSearchParams()

  // Pre-select tokens from URL query params (?tokenA=WQF&tokenB=QF)
  useEffect(() => {
    const paramA = searchParams.get('tokenA')
    const paramB = searchParams.get('tokenB')
    if (paramA) { const t = tokenList.find(t => t.symbol === paramA); if (t) setTokenA(t) }
    if (paramB) { const t = tokenList.find(t => t.symbol === paramB); if (t) setTokenB(t) }
  }, [searchParams, tokenList])

  const balances = useTokenBalances(
    evmAddress,
    tokenList.map(t => t.address),
    account?.address,
  )

  // Build disabled address lists: always disable the other selected token, and
  // also disable the QF/WQF pair (native QF and its wrapper cannot be paired).
  function getDisabledAddresses(other: Token | undefined): string[] {
    const disabled: string[] = []
    if (other) disabled.push(other.address)
    if (other?.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) disabled.push(TOKENS.WQF)
    if (other?.address.toLowerCase() === TOKENS.WQF.toLowerCase()) disabled.push(NATIVE_TOKEN_ADDRESS)
    return disabled
  }

  const isProcessing = step === 'approving-a' || step === 'approving-b' || step === 'creating-pair' || step === 'adding'
  const canSupply = !!account && !!tokenA && !!tokenB && !!amountA && !!amountB && !isProcessing && step !== 'success'
  const addrA = tokenA?.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() ? TOKENS.WQF : tokenA?.address
  const isToken0A = !!tokenA && !!pair.token0 && addrA?.toLowerCase() === pair.token0.toLowerCase()
  const reserveA = isToken0A ? pair.reserve0 : pair.reserve1
  const reserveB = isToken0A ? pair.reserve1 : pair.reserve0
  const isInitialLiquidity = !pair.exists || (pair.reserve0 === 0n && pair.reserve1 === 0n)

  function handleAmountAChange(value: string) {
    setAmountA(value)
    if (!value) {
      setAmountB('')
      return
    }
    if (!tokenA || !tokenB || isInitialLiquidity || reserveA === 0n) return

    try {
      const rawAmountA = parseUnits(value, tokenA.decimals)
      const rawAmountB = (rawAmountA * reserveB) / reserveA
      setAmountB(formatAmount(rawAmountB, tokenB.decimals))
    }
    catch {
      // Ignore partial/in-progress numeric input.
    }
  }

  function handleAmountBChange(value: string) {
    setAmountB(value)
    if (!value) {
      setAmountA('')
      return
    }
    if (!tokenA || !tokenB || isInitialLiquidity || reserveB === 0n) return

    try {
      const rawAmountB = parseUnits(value, tokenB.decimals)
      const rawAmountA = (rawAmountB * reserveA) / reserveB
      setAmountA(formatAmount(rawAmountA, tokenA.decimals))
    }
    catch {
      // Ignore partial/in-progress numeric input.
    }
  }

  const setPercent = (token: Token | undefined, setAmount: (value: string) => void, pct: number) => {
    if (!token) return
    const balance = balances.get(token.address.toLowerCase())
    if (!balance) return
    let raw = (balance.balance * BigInt(pct)) / 100n
    if (pct === 100 && token.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
      raw = raw > NATIVE_GAS_RESERVE ? raw - NATIVE_GAS_RESERVE : 0n
    }
    setAmount(formatAmount(raw, token.decimals))
  }

  function getButtonLabel(): string {
    if (!account) return 'Connect Wallet'
    if (step === 'approving-a') return `Approving ${tokenA?.symbol ?? 'Token A'}...`
    if (step === 'approving-b') return `Approving ${tokenB?.symbol ?? 'Token B'}...`
    if (step === 'creating-pair') return 'Creating Pair...'
    if (step === 'adding') return 'Adding Liquidity...'
    if (!tokenA || !tokenB) return 'Select Tokens'
    if (!amountA || !amountB) return 'Enter Amounts'
    if (isInitialLiquidity) return 'Create & Supply'
    return 'Supply'
  }

  async function handleSupply() {
    if (!tokenA || !tokenB || !amountA || !amountB) return
    try {
      const bigAmountA = parseUnits(amountA, tokenA.decimals)
      const bigAmountB = parseUnits(amountB, tokenB.decimals)
      if (bigAmountA === 0n || bigAmountB === 0n) return
      await supply(tokenA, tokenB, bigAmountA, bigAmountB)
    }
    catch {
      // Ignore invalid numeric input.
    }
  }

  return (
    <div className="space-y-3">
      {/* Token A input */}
      <div
        className="rounded-2xl p-4 border transition-colors duration-200 focus-within:border-ncx-purple-400"
        style={{ background: 'var(--ncx-surface-2)', borderColor: 'var(--ncx-border)' }}
      >
        <div className="flex justify-between mb-2 ncx-num text-[10px] uppercase tracking-[0.12em] text-ncx-text-muted">
          <span>Deposit</span>
          {tokenA && (
            <span>Balance: {balances.get(tokenA.address.toLowerCase())?.formatted ?? '—'}</span>
          )}
        </div>
        <div className="flex justify-between items-center gap-3">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            className="bg-transparent ncx-num text-2xl font-medium text-ncx-text focus:outline-none placeholder:text-ncx-text-subtle/50 w-full min-w-0 tracking-tight"
            value={amountA}
            onChange={e => handleAmountAChange(e.target.value)}
          />
          <div className="shrink-0">
            <TokenSelector selectedToken={tokenA} onSelectToken={setTokenA} balances={balances} disabledAddresses={getDisabledAddresses(tokenB)} />
          </div>
        </div>
        {tokenA && (balances.get(tokenA.address.toLowerCase())?.balance ?? 0n) > 0n && (
          <div className="flex gap-1.5 mt-3">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => setPercent(tokenA, handleAmountAChange, pct)}
                className="flex-1 py-1.5 rounded-full ncx-num text-[10px] uppercase tracking-[0.1em] text-ncx-text-muted border transition-all duration-200 hover:text-ncx-purple-300 hover:bg-ncx-wash"
                style={{ background: 'var(--ncx-surface-3)', borderColor: 'var(--ncx-border)' }}
              >
                {pct === 100 ? 'Max' : `${pct}%`}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center -my-1.5 relative z-10">
        <div
          className="w-9 h-9 rounded-full grid place-items-center text-ncx-purple-300"
          style={{ background: 'var(--ncx-surface-3)', border: '3px solid var(--ncx-surface)' }}
        >
          <Plus className="w-4 h-4" />
        </div>
      </div>

      {/* Token B input */}
      <div
        className="rounded-2xl p-4 border transition-colors duration-200 focus-within:border-ncx-purple-400"
        style={{ background: 'var(--ncx-surface-2)', borderColor: 'var(--ncx-border)' }}
      >
        <div className="flex justify-between mb-2 ncx-num text-[10px] uppercase tracking-[0.12em] text-ncx-text-muted">
          <span>Deposit</span>
          {tokenB && (
            <span>Balance: {balances.get(tokenB.address.toLowerCase())?.formatted ?? '—'}</span>
          )}
        </div>
        <div className="flex justify-between items-center gap-3">
          <input
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            className="bg-transparent ncx-num text-2xl font-medium text-ncx-text focus:outline-none placeholder:text-ncx-text-subtle/50 w-full min-w-0 tracking-tight"
            value={amountB}
            onChange={e => handleAmountBChange(e.target.value)}
          />
          <div className="shrink-0">
            <TokenSelector selectedToken={tokenB} onSelectToken={setTokenB} balances={balances} disabledAddresses={getDisabledAddresses(tokenA)} />
          </div>
        </div>
        {tokenB && (balances.get(tokenB.address.toLowerCase())?.balance ?? 0n) > 0n && (
          <div className="flex gap-1.5 mt-3">
            {[25, 50, 75, 100].map(pct => (
              <button
                key={pct}
                type="button"
                onClick={() => setPercent(tokenB, handleAmountBChange, pct)}
                className="flex-1 py-1.5 rounded-full ncx-num text-[10px] uppercase tracking-[0.1em] text-ncx-text-muted border transition-all duration-200 hover:text-ncx-purple-300 hover:bg-ncx-wash"
                style={{ background: 'var(--ncx-surface-3)', borderColor: 'var(--ncx-border)' }}
              >
                {pct === 100 ? 'Max' : `${pct}%`}
              </button>
            ))}
          </div>
        )}
      </div>

      {tokenA && tokenB && (
        <div
          className="rounded-2xl p-3.5 border"
          style={{ background: 'var(--ncx-wash)', borderColor: 'color-mix(in srgb, var(--ncx-purple-500) 20%, transparent)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="ncx-num text-[10px] uppercase tracking-[0.12em] text-ncx-text-muted">
              {isInitialLiquidity ? 'Initial liquidity' : 'Pool rate'}
            </span>
            {pair.isLoading && <Loader2 className="w-3.5 h-3.5 text-ncx-purple-300 animate-spin" />}
          </div>
          {isInitialLiquidity ? (
            <p className="text-ncx-text-muted text-xs leading-relaxed">
              This pair has no liquidity yet. The ratio you provide will set the initial pool price.
            </p>
          ) : (
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-ncx-text-muted">1 {tokenA.symbol}</span>
                <span className="ncx-num text-ncx-text">
                  {formatRatio(reserveB, reserveA, tokenB.decimals, tokenA.decimals)} {tokenB.symbol}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-ncx-text-muted">1 {tokenB.symbol}</span>
                <span className="ncx-num text-ncx-text">
                  {formatRatio(reserveA, reserveB, tokenA.decimals, tokenB.decimals)} {tokenA.symbol}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Supply button */}
      <button
        onClick={handleSupply}
        disabled={!canSupply}
        className="btn-ncx btn-ncx-primary w-full mt-2"
        style={{ padding: '0.95rem 1.25rem', fontSize: '0.9375rem' }}
      >
        {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
        {getButtonLabel()}
      </button>

      {/* Error */}
      {error && (
        <div
          className="p-3 rounded-2xl text-xs flex items-start justify-between gap-2"
          style={{ background: 'var(--ncx-loss-bg)', color: 'var(--ncx-loss)', border: '1px solid color-mix(in srgb, var(--ncx-loss) 30%, transparent)' }}
        >
          <span>{error}</span>
          <button onClick={reset} className="shrink-0 underline hover:no-underline">Dismiss</button>
        </div>
      )}

      {/* Success */}
      {step === 'success' && txHash && (
        <div
          className="p-3 rounded-2xl ncx-num text-[11px] break-all"
          style={{ background: 'var(--ncx-gain-bg)', color: 'var(--ncx-gain)', border: '1px solid color-mix(in srgb, var(--ncx-gain) 30%, transparent)' }}
        >
          <div className="font-semibold mb-1">Liquidity added</div>
          <div>{txHash}</div>
          <button onClick={() => { reset(); setAmountA(''); setAmountB('') }} className="mt-2 underline hover:no-underline">
            Add more
          </button>
        </div>
      )}
    </div>
  )
}
