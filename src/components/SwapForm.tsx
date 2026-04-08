import { useAtom, useSelector } from '@xstate/store/react'
import { ArrowDown, Loader2, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { selectedAccount } from '../hooks/useConnect'
import { useSwap } from '../hooks/useSwap'
import { useTokenBalances } from '../hooks/useTokenBalances'
import SettingsModal from './SettingsModal'
import { dexStore, selectTokenList } from '../store/dexStore'
import type { Token } from '../store/dexStore'
import TokenSelector from './TokenSelector'

export default function SwapForm() {
  const account = useAtom(selectedAccount)
  const tokenList = useSelector(dexStore, selectTokenList)

  const [payAmount, setPayAmount] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('')
  const [payToken, setPayToken] = useState<Token | undefined>()
  const [receiveToken, setReceiveToken] = useState<Token | undefined>()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const { quote, isQuoting, isCheckingAllowance, isApproving, isSwapping, txHash, error, evmAddress, fetchQuote, swap, clearError } = useSwap()

  const balances = useTokenBalances(
    evmAddress,
    tokenList.map(t => t.address),
    account?.address,
  )

  // Debounced quote fetch
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

  // Sync quote result to receive input
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

  const isProcessing = isCheckingAllowance || isApproving || isSwapping
  const canSwap = !!account && !!payToken && !!receiveToken && !!payAmount && !!quote && !isProcessing

  function getButtonLabel() {
    if (!account) return 'Connect Wallet'
    if (isCheckingAllowance) return 'Checking Allowance...'
    if (isApproving) return 'Approving...'
    if (isSwapping) return 'Swapping...'
    if (isQuoting) return 'Fetching Quote...'
    if (!payToken || !receiveToken) return 'Select Tokens'
    if (!payAmount) return 'Enter Amount'
    if (!quote) return 'No Route Found'
    return 'Swap'
  }

  return (
    <div className="w-full max-w-md border-2 border-[#2D0A5B] p-6 bg-[#0A0A0A]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold uppercase tracking-widest text-[#F2F2F2]">Swap</h2>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-[#A1A1A1] hover:text-[#F2F2F2] transition-colors duration-150"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Pay Input */}
        <div className="border border-[#2D0A5B] p-4">
          <div className="flex justify-between mb-3">
            <span className="text-[#A1A1A1] text-xs font-bold uppercase tracking-[0.2em]">You Pay</span>
            {payToken && (
              <span className="text-[#A1A1A1] text-xs font-bold">
                Balance: {balances.get(payToken.address.toLowerCase())?.formatted ?? '—'}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center gap-4">
            <input
              type="text"
              placeholder="0.0"
              className="bg-transparent text-2xl font-bold text-[#F2F2F2] focus:outline-none placeholder:text-[#A1A1A1]/30 w-full"
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
            />
            <div className="shrink-0">
              <TokenSelector selectedToken={payToken} onSelectToken={setPayToken} balances={balances} />
            </div>
          </div>
        </div>

        {/* Swap Arrow Button */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            onClick={handleSwapTokens}
            className="p-2 bg-[#2D0A5B] text-[#7B3FE4] hover:bg-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150 group"
          >
            <ArrowDown className="w-5 h-5 group-hover:rotate-180 transition-transform duration-150" />
          </button>
        </div>

        {/* Receive Input */}
        <div className="border border-[#2D0A5B] p-4">
          <div className="flex justify-between mb-3">
            <span className="text-[#A1A1A1] text-xs font-bold uppercase tracking-[0.2em]">You Receive</span>
            {receiveToken && (
              <span className="text-[#A1A1A1] text-xs font-bold">
                Balance: {balances.get(receiveToken.address.toLowerCase())?.formatted ?? '—'}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center gap-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="0.0"
                className="bg-transparent text-2xl font-bold text-[#F2F2F2] focus:outline-none placeholder:text-[#A1A1A1]/30 w-full"
                value={receiveAmount}
                readOnly
              />
              {isQuoting && (
                <Loader2 className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7B3FE4] animate-spin" />
              )}
            </div>
            <div className="shrink-0">
              <TokenSelector selectedToken={receiveToken} onSelectToken={setReceiveToken} balances={balances} />
            </div>
          </div>
        </div>
      </div>

      {/* Quote info */}
      {quote && payToken && receiveToken && (
        <div className="mt-3 px-1 flex justify-between text-xs text-[#A1A1A1] font-bold uppercase tracking-wider">
          <span>Min. Received</span>
          <span>
            {(Number(quote.amountOutMin) / 10 ** receiveToken.decimals).toFixed(6)}
            {' '}
            {receiveToken.symbol}
          </span>
        </div>
      )}

      {/* Swap Button */}
      <div className="mt-4">
        <button
          onClick={handleSwap}
          disabled={!canSwap}
          className="w-full py-4 bg-[#7B3FE4] text-[#F2F2F2] text-sm font-bold uppercase tracking-widest hover:bg-[#2D0A5B] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
          {getButtonLabel()}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 p-3 border border-red-800 bg-red-950/30 text-red-400 text-xs font-bold uppercase tracking-wider">
          {error}
        </div>
      )}

      {/* Success */}
      {txHash && !isProcessing && (
        <div className="mt-3 p-3 border border-[#2D0A5B] bg-[#2D0A5B]/20 text-[#7B3FE4] text-xs font-bold uppercase tracking-wider break-all">
          Tx: {txHash}
        </div>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
