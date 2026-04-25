import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { TokenBalance } from '../hooks/useTokenBalances'
import TokenModal, { type Token } from './TokenModal'

interface TokenSelectorProps {
  selectedToken?: Token
  onSelectToken: (token: Token) => void
  balances?: Map<string, TokenBalance>
  disabledAddresses?: string[]
}

export default function TokenSelector({ selectedToken, onSelectToken, balances, disabledAddresses }: TokenSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSelectToken = (token: Token) => {
    onSelectToken(token)
    setIsModalOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border transition-all duration-200 group hover:border-ncx-purple-500"
        style={{
          background: 'var(--ncx-surface-3)',
          borderColor: 'var(--ncx-border)',
          fontWeight: 600,
        }}
      >
        {selectedToken ? (
          <>
            {selectedToken.iconClass ? (
              <span className={`${selectedToken.iconClass} w-6 h-6 rounded-full`} />
            ) : (
              <span
                className="w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--ncx-purple-300), var(--ncx-purple-700))' }}
              >
                {selectedToken.symbol[0]}
              </span>
            )}
            <span className="text-sm text-ncx-text">{selectedToken.symbol}</span>
          </>
        ) : (
          <span className="text-sm text-ncx-text-muted px-2">Select</span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-ncx-text-subtle group-hover:text-ncx-purple-300 transition-colors duration-200" />
      </button>

      <TokenModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectToken={handleSelectToken}
        balances={balances}
        disabledAddresses={disabledAddresses}
      />
    </>
  )
}
