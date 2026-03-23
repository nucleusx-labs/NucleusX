import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import TokenModal, { type Token } from './TokenModal'

interface TokenSelectorProps {
  selectedToken?: Token
  onSelectToken: (token: Token) => void
}

export default function TokenSelector({ selectedToken, onSelectToken }: TokenSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSelectToken = (token: Token) => {
    onSelectToken(token)
    setIsModalOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800 border border-white/5 rounded-2xl px-3 py-2 transition-all shadow-sm group"
      >
        {selectedToken ? (
          <>
            {selectedToken.iconClass ? (
              <div className={`${selectedToken.iconClass} w-6 h-6 rounded-full bg-white`} />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                {selectedToken.symbol[0]}
              </div>
            )}
            <span className="font-bold text-slate-200 group-hover:text-white">{selectedToken.symbol}</span>
          </>
        ) : (
          <span className="font-bold text-slate-200 px-2">Select Token</span>
        )}
        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
      </button>

      <TokenModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSelectToken={handleSelectToken} 
      />
    </>
  )
}
