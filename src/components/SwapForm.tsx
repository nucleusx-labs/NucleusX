import { useState } from 'react'
import { ArrowDown, Settings } from 'lucide-react'
import TokenSelector from './TokenSelector'
import type { Token } from './TokenModal'
import SettingsModal from './SettingsModal'

export default function SwapForm() {
  const [payAmount, setPayAmount] = useState('')
  const [receiveAmount, setReceiveAmount] = useState('')
  const [payToken, setPayToken] = useState<Token | undefined>()
  const [receiveToken, setReceiveToken] = useState<Token | undefined>()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleSwapTokens = () => {
    const tempPayAmt = payAmount
    setPayAmount(receiveAmount)
    setReceiveAmount(tempPayAmt)

    const tempPayToken = payToken
    setPayToken(receiveToken)
    setReceiveToken(tempPayToken)
  }

  return (
    <div className="w-full max-w-md panel-brutal p-4 relative">
      <div className="noise-overlay opacity-20"></div>
      <div className="flex items-center justify-between px-2 mb-4 relative z-10">
        <h2 className="text-xl font-black uppercase tracking-tight text-brutalist-panel-text">Swap</h2>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 border-[2px] border-transparent hover:border-black text-brutalist-text-muted hover:text-black hover:bg-brutalist-accent transition-all duration-75"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 relative z-10 xl:mb-2">
        {/* Pay Input */}
        <div className="input-container-brutal">
          <div className="flex justify-between mb-2">
            <span className="text-brutalist-text-muted text-xs font-black uppercase tracking-widest">You Pay</span>
            {payToken?.balance && (
              <span className="text-brutalist-text-muted text-xs font-mono">
                Balance: {payToken.balance}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center gap-4">
            <input
              type="text"
              placeholder="0.0"
              className="input-brutal"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
            <div className="shrink-0">
              <TokenSelector selectedToken={payToken} onSelectToken={setPayToken} />
            </div>
          </div>
        </div>

        {/* Swap Arrow Button */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            onClick={handleSwapTokens}
            className="p-2 bg-brutalist-accent border-[3px] border-black text-black hover:bg-black hover:text-brutalist-accent transition-all duration-75 shadow-[3px_3px_0_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] group"
          >
            <ArrowDown className="w-5 h-5 group-hover:rotate-180 transition-transform duration-75 step-end" />
          </button>
        </div>

        {/* Receive Input */}
        <div className="input-container-brutal">
          <div className="flex justify-between mb-2">
            <span className="text-brutalist-text-muted text-xs font-black uppercase tracking-widest">You Receive</span>
            {receiveToken?.balance && (
              <span className="text-brutalist-text-muted text-xs font-mono">
                Balance: {receiveToken.balance}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center gap-4">
            <input
              type="text"
              placeholder="0.0"
              className="input-brutal"
              value={receiveAmount}
              onChange={(e) => setReceiveAmount(e.target.value)}
              readOnly
            />
            <div className="shrink-0">
              <TokenSelector selectedToken={receiveToken} onSelectToken={setReceiveToken} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 relative z-10">
        <button className="btn-brutal w-full text-lg">Swap</button>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
