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
        className="flex items-center gap-2 bg-brutalist-bg border-[2px] border-black px-3 py-2 transition-all duration-75 shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] group"
      >
        {selectedToken ? (
          <>
            {selectedToken.iconClass ? (
              <div className={`${selectedToken.iconClass} w-6 h-6 rounded-full bg-white`} />
            ) : (
              <div className="w-6 h-6 bg-brutalist-accent flex items-center justify-center text-black font-black text-xs border-[1px] border-black">
                {selectedToken.symbol[0]}
              </div>
            )}
            <span className="font-black uppercase text-brutalist-text group-hover:text-brutalist-accent">{selectedToken.symbol}</span>
          </>
        ) : (
          <span className="font-black uppercase text-brutalist-text px-2">Select</span>
        )}
        <ChevronDown className="w-4 h-4 text-brutalist-text-muted group-hover:text-brutalist-accent transition-colors duration-75" />
      </button>

      <TokenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectToken={handleSelectToken}
      />
    </>
  )
}
