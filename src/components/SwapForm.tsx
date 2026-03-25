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
            {payToken?.balance && (
              <span className="text-[#A1A1A1] text-xs font-bold">Balance: {payToken.balance}</span>
            )}
          </div>
          <div className="flex justify-between items-center gap-4">
            <input
              type="text"
              placeholder="0.0"
              className="bg-transparent text-2xl font-bold text-[#F2F2F2] focus:outline-none placeholder:text-[#A1A1A1]/30 w-full"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
            <div className="shrink-0">
              <TokenSelector selectedToken={payToken} onSelectToken={setPayToken} />
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
            {receiveToken?.balance && (
              <span className="text-[#A1A1A1] text-xs font-bold">Balance: {receiveToken.balance}</span>
            )}
          </div>
          <div className="flex justify-between items-center gap-4">
            <input
              type="text"
              placeholder="0.0"
              className="bg-transparent text-2xl font-bold text-[#F2F2F2] focus:outline-none placeholder:text-[#A1A1A1]/30 w-full"
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

      <div className="mt-4">
        <button className="w-full py-4 bg-[#7B3FE4] text-[#F2F2F2] text-sm font-bold uppercase tracking-widest hover:bg-[#2D0A5B] transition-colors duration-150">
          Swap
        </button>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
