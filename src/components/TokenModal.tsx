import { X, Search } from 'lucide-react'
import { useState } from 'react'

export interface Token {
  symbol: string
  name: string
  address: string
  decimals: number
  iconUrl?: string
  iconClass?: string
  balance?: string
}

export const MOCK_TOKENS: Token[] = [
  { symbol: 'DOT', name: 'Polkadot', address: '0x1', decimals: 10, balance: '142.5', iconClass: 'icon-[token-branded--polkadot]' },
  { symbol: 'USDC', name: 'USD Coin', address: '0x2', decimals: 6, balance: '1050.00', iconClass: 'icon-[token-branded--usdc]' },
  { symbol: 'USDT', name: 'Tether USD', address: '0x3', decimals: 6, balance: '0.00', iconClass: 'icon-[token-branded--usdt]' },
  { symbol: 'WETH', name: 'Wrapped Ether', address: '0x4', decimals: 18, balance: '1.24', iconClass: 'icon-[token-branded--eth]' },
]

interface TokenModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectToken: (token: Token) => void
}

export default function TokenModal({ isOpen, onClose, onSelectToken }: TokenModalProps) {
  const [searchQuery, setSearchQuery] = useState('')

  if (!isOpen) return null

  const filteredTokens = MOCK_TOKENS.filter(t =>
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative w-full max-w-md border-2 border-[#2D0A5B] bg-[#0A0A0A] overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-5 border-b border-[#2D0A5B] flex items-center justify-between">
          <h3 className="text-base font-bold uppercase tracking-widest text-[#F2F2F2]">Select Token</h3>
          <button
            onClick={onClose}
            className="p-1 text-[#A1A1A1] hover:text-[#F2F2F2] transition-colors duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-[#2D0A5B]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A1]" />
            <input
              type="text"
              placeholder="Search name or paste address"
              className="w-full bg-transparent border border-[#2D0A5B] py-3 pl-10 pr-4 text-[#F2F2F2] placeholder:text-[#A1A1A1]/50 focus:outline-none focus:border-[#7B3FE4] text-sm uppercase tracking-wider transition-colors duration-150"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => onSelectToken(token)}
                className="w-full flex items-center justify-between px-5 py-4 border-b border-[#2D0A5B]/50 last:border-b-0 hover:bg-[#2D0A5B] transition-colors duration-150"
              >
                <div className="flex items-center gap-4">
                  {token.iconClass ? (
                    <div className={`${token.iconClass} w-9 h-9 rounded-full`} />
                  ) : (
                    <div className="w-9 h-9 bg-[#2D0A5B] flex items-center justify-center text-[#7B3FE4] font-bold text-sm">
                      {token.symbol[0]}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-bold uppercase text-[#F2F2F2] text-sm">{token.symbol}</div>
                    <div className="text-xs text-[#A1A1A1]">{token.name}</div>
                  </div>
                </div>
                {token.balance && (
                  <div className="font-bold text-[#F2F2F2] text-sm">{token.balance}</div>
                )}
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-[#A1A1A1] font-bold uppercase tracking-[0.2em] text-sm">
              No tokens found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
