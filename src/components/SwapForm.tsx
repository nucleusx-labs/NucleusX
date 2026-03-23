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
    <div className="w-full max-w-md glass-panel rounded-[2rem] p-4 relative shadow-2xl shadow-indigo-500/10">
      <div className="flex items-center justify-between px-2 mb-4">
        <h2 className="text-xl text-slate-200 font-bold">Swap</h2>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 relative xl:mb-2">
        {/* Pay Input */}
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-4 hover:border-white/10 transition-colors focus-within:border-indigo-500/50">
          <div className="flex justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">You Pay</span>
            {payToken?.balance && (
              <span className="text-slate-500 text-sm font-mono">
                Balance: {payToken.balance}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center gap-4">
            <input 
              type="text"
              placeholder="0.0"
              className="w-full bg-transparent text-3xl font-mono text-slate-200 focus:outline-none placeholder:text-slate-600"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
            <div className="shrink-0">
              <TokenSelector 
                selectedToken={payToken}
                onSelectToken={setPayToken}
              />
            </div>
          </div>
        </div>

        {/* Swap Arrow Button */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button 
            onClick={handleSwapTokens}
            className="p-2 bg-slate-800 border-4 border-slate-950 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-lg group"
          >
            <ArrowDown className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* Receive Input */}
        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-4 hover:border-white/10 transition-colors focus-within:border-indigo-500/50">
           <div className="flex justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">You Receive</span>
            {receiveToken?.balance && (
              <span className="text-slate-500 text-sm font-mono">
                Balance: {receiveToken.balance}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center gap-4">
            <input 
              type="text"
              placeholder="0.0"
              className="w-full bg-transparent text-3xl font-mono text-slate-200 focus:outline-none placeholder:text-slate-600"
              value={receiveAmount}
              onChange={(e) => setReceiveAmount(e.target.value)}
              readOnly
            />
            <div className="shrink-0">
              <TokenSelector 
                selectedToken={receiveToken}
                onSelectToken={setReceiveToken}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 opacity-80 group-hover:opacity-100 transition-opacity">
         <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]">
           Swap
         </button>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}
