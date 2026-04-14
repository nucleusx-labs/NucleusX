import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { TokenBalance } from '../hooks/useTokenBalances'
import TokenModal, { type Token } from './TokenModal'

interface TokenSelectorProps {
  selectedToken?: Token
  onSelectToken: (token: Token) => void
  balances?: Map<string, TokenBalance>
  disabledAddress?: string
}

export default function TokenSelector({ selectedToken, onSelectToken, balances, disabledAddress }: TokenSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSelectToken = (token: Token) => {
    onSelectToken(token)
    setIsModalOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 border border-[#2D0A5B] px-3 py-2 hover:border-[#7B3FE4] transition-colors duration-150 group"
      >
        {selectedToken
          ? (
              <>
                {selectedToken.iconClass
                  ? (
                      <div className={`${selectedToken.iconClass} w-5 h-5 rounded-full`} />
                    )
                  : (
                      <div className="w-5 h-5 bg-[#2D0A5B] flex items-center justify-center text-[#7B3FE4] font-bold text-xs">
                        {selectedToken.symbol[0]}
                      </div>
                    )}
                <span className="font-bold uppercase text-[#F2F2F2] text-sm">{selectedToken.symbol}</span>
              </>
            )
          : (
              <span className="font-bold uppercase text-[#A1A1A1] text-sm px-1">Select</span>
            )}
        <ChevronDown className="w-4 h-4 text-[#A1A1A1] group-hover:text-[#7B3FE4] transition-colors duration-150" />
      </button>

      <TokenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectToken={handleSelectToken}
        balances={balances}
        disabledAddress={disabledAddress}
      />
    </>
  )
}
