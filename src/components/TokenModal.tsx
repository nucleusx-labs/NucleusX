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

      <div className="relative w-full max-w-md panel-brutal overflow-hidden flex flex-col max-h-[85vh]">
        <div className="noise-overlay opacity-20"></div>
        <div className="p-4 border-b-[3px] border-black flex items-center justify-between relative z-10">
          <h3 className="text-xl font-black uppercase tracking-tight text-brutalist-panel-text">Select Token</h3>
          <button
            onClick={onClose}
            className="p-2 border-[2px] border-transparent hover:border-black text-brutalist-text-muted hover:text-black hover:bg-brutalist-accent transition-all duration-75"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b-[2px] border-black relative z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brutalist-text-muted" />
            <input
              type="text"
              placeholder="Search name or paste address"
              className="w-full bg-brutalist-input-bg border-[2px] border-black py-3 pl-11 pr-4 text-brutalist-panel-text placeholder:text-brutalist-text-muted focus:outline-none font-bold text-sm uppercase tracking-wider"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 relative z-10">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => onSelectToken(token)}
                className="w-full flex items-center justify-between p-3 border-[2px] border-transparent hover:border-black hover:bg-brutalist-hover transition-all duration-75 group"
              >
                <div className="flex items-center gap-4">
                  {token.iconClass ? (
                    <div className={`${token.iconClass} w-10 h-10 rounded-full bg-white border-[2px] border-black shadow-[2px_2px_0_#000]`} />
                  ) : (
                    <div className="w-10 h-10 bg-brutalist-accent flex items-center justify-center text-black font-black text-sm border-[2px] border-black shadow-[2px_2px_0_#000]">
                      {token.symbol[0]}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-black uppercase text-brutalist-panel-text">
                      {token.symbol}
                    </div>
                    <div className="text-xs text-brutalist-text-muted font-bold uppercase">
                      {token.name}
                    </div>
                  </div>
                </div>
                {token.balance && (
                  <div className="font-mono font-bold text-brutalist-panel-text">
                    {token.balance}
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-brutalist-text-muted font-black uppercase tracking-widest text-sm">
              No tokens found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
