import { useAtom, useSelector } from '@xstate/store/react'
import { Loader2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { selectedAccount } from '../hooks/useConnect'
import { useTokenBalances } from '../hooks/useTokenBalances'
import { useAddLiquidity } from '../hooks/useAddLiquidity'
import { dexStore, selectTokenList } from '../store/dexStore'
import TokenSelector from './TokenSelector'
import type { Token } from '../store/dexStore'

export default function AddLiquidityForm() {
  const account = useAtom(selectedAccount)
  const tokenList = useSelector(dexStore, selectTokenList)

  const [tokenA, setTokenA] = useState<Token | undefined>()
  const [tokenB, setTokenB] = useState<Token | undefined>()
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')

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
    [tokenA?.address, tokenB?.address],
    account?.address,
  )

  const isProcessing = step === 'approving-a' || step === 'approving-b' || step === 'adding'
  const canSupply = !!account && !!tokenA && !!tokenB && !!amountA && !!amountB && !isProcessing && step !== 'success'

  function getButtonLabel(): string {
    if (!account) return 'Connect Wallet'
    if (step === 'approving-a') return `Approving ${tokenA?.symbol ?? 'Token A'}...`
    if (step === 'approving-b') return `Approving ${tokenB?.symbol ?? 'Token B'}...`
    if (step === 'adding') return 'Adding Liquidity...'
    if (!tokenA || !tokenB) return 'Select Tokens'
    if (!amountA || !amountB) return 'Enter Amounts'
    return 'Supply'
  }

  async function handleSupply() {
    if (!tokenA || !tokenB || !amountA || !amountB) return
    const bigAmountA = BigInt(Math.floor(Number(amountA) * 10 ** tokenA.decimals))
    const bigAmountB = BigInt(Math.floor(Number(amountB) * 10 ** tokenB.decimals))
    if (bigAmountA === 0n || bigAmountB === 0n) return
    await supply(tokenA, tokenB, bigAmountA, bigAmountB)
  }

  return (
    <div className="space-y-4">
      {/* Token A input */}
      <div className="border border-[#2D0A5B] p-4">
        <div className="flex justify-between mb-3">
          <span className="text-[#A1A1A1] text-xs font-bold uppercase tracking-[0.2em]">Deposit Amount</span>
          {tokenA && (
            <span className="text-[#A1A1A1] text-xs font-bold">
              Balance: {balances.get(tokenA.address.toLowerCase())?.formatted ?? '—'}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center gap-4">
          <input
            type="text"
            placeholder="0.0"
            className="bg-transparent text-2xl font-bold text-[#F2F2F2] focus:outline-none placeholder:text-[#A1A1A1]/30 w-full"
            value={amountA}
            onChange={e => setAmountA(e.target.value)}
          />
          <div className="shrink-0">
            <TokenSelector selectedToken={tokenA} onSelectToken={setTokenA} balances={balances} />
          </div>
        </div>
      </div>

      <div className="flex justify-center -my-2 relative z-10">
        <div className="bg-[#2D0A5B] p-2 text-[#7B3FE4]">
          <Plus className="w-4 h-4" />
        </div>
      </div>

      {/* Token B input */}
      <div className="border border-[#2D0A5B] p-4">
        <div className="flex justify-between mb-3">
          <span className="text-[#A1A1A1] text-xs font-bold uppercase tracking-[0.2em]">Deposit Amount</span>
          {tokenB && (
            <span className="text-[#A1A1A1] text-xs font-bold">
              Balance: {balances.get(tokenB.address.toLowerCase())?.formatted ?? '—'}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center gap-4">
          <input
            type="text"
            placeholder="0.0"
            className="bg-transparent text-2xl font-bold text-[#F2F2F2] focus:outline-none placeholder:text-[#A1A1A1]/30 w-full"
            value={amountB}
            onChange={e => setAmountB(e.target.value)}
          />
          <div className="shrink-0">
            <TokenSelector selectedToken={tokenB} onSelectToken={setTokenB} balances={balances} />
          </div>
        </div>
      </div>

      {/* Supply button */}
      <div className="pt-4">
        <button
          onClick={handleSupply}
          disabled={!canSupply}
          className="w-full py-4 bg-[#7B3FE4] text-[#F2F2F2] text-sm font-bold uppercase tracking-widest hover:bg-[#2D0A5B] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
          {getButtonLabel()}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 border border-red-800 bg-red-950/30 text-red-400 text-xs font-bold uppercase tracking-wider flex items-start justify-between gap-2">
          <span>{error}</span>
          <button onClick={reset} className="shrink-0 underline hover:no-underline">Dismiss</button>
        </div>
      )}

      {/* Success */}
      {step === 'success' && txHash && (
        <div className="p-3 border border-[#2D0A5B] bg-[#2D0A5B]/20 text-[#7B3FE4] text-xs font-bold uppercase tracking-wider break-all">
          <div className="mb-1">Liquidity added</div>
          <div className="font-mono">{txHash}</div>
          <button onClick={() => { reset(); setAmountA(''); setAmountB('') }} className="mt-2 underline hover:no-underline">
            Add more
          </button>
        </div>
      )}
    </div>
  )
}
