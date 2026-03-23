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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md glass-panel rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/10 flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-200">Select a token</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text"
              placeholder="Search name or paste address"
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => (
              <button
                key={token.address}
                onClick={() => onSelectToken(token)}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  {token.iconClass ? (
                    <div className={`${token.iconClass} w-10 h-10 rounded-full shadow-lg bg-white ring-1 ring-white/10`} />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                      {token.symbol[0]}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-bold text-slate-200 group-hover:text-white transition-colors">
                      {token.symbol}
                    </div>
                    <div className="text-xs text-slate-500">
                      {token.name}
                    </div>
                  </div>
                </div>
                {token.balance && (
                  <div className="text-right">
                    <div className="font-mono text-slate-300">
                      {token.balance}
                    </div>
                  </div>
                )}
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-slate-500">
              No tokens found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
