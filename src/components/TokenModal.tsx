import { X, Search } from 'lucide-react'
import { useState } from 'react'
import { useSelector } from '@xstate/store/react'
import { dexStore, selectTokenList } from '../store/dexStore'
import type { Token } from '../store/dexStore'
import type { TokenBalance } from '../hooks/useTokenBalances'

export type { Token }

interface TokenModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectToken: (token: Token) => void
  balances?: Map<string, TokenBalance>
  disabledAddresses?: string[]
}

export default function TokenModal({ isOpen, onClose, onSelectToken, balances, disabledAddresses }: TokenModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const tokenList = useSelector(dexStore, selectTokenList)

  if (!isOpen) return null

  const filteredTokens = tokenList.filter(t =>
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    || t.name.toLowerCase().includes(searchQuery.toLowerCase())
    || t.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'color-mix(in srgb, var(--ncx-ink-0) 72%, transparent)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />

      <div
        className="relative w-full sm:max-w-md ncx-modal flex flex-col max-h-[85vh] sm:max-h-[80vh] rounded-t-2xl sm:rounded-3xl"
        style={{ animation: 'fadeUp 0.32s var(--ncx-ease-out)' }}
      >
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-ncx-border">
          <h3 className="text-base font-semibold text-ncx-text">Select token</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ncx-text-subtle hover:text-ncx-text hover:bg-ncx-wash transition-all duration-150"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-ncx-border">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ncx-text-subtle" />
            <input
              type="text"
              placeholder="Name or address"
              className="ncx-input pl-11"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => {
              const bal = balances?.get(token.address.toLowerCase())
              const disabled = !!disabledAddresses?.some(a => a.toLowerCase() === token.address.toLowerCase())
              return (
                <button
                  key={token.address}
                  onClick={() => !disabled && onSelectToken(token)}
                  disabled={disabled}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-ncx-wash transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {token.iconClass ? (
                    <span className={`${token.iconClass} w-9 h-9 rounded-full shrink-0`} />
                  ) : (
                    <span
                      className="w-9 h-9 rounded-full grid place-items-center text-[13px] font-bold text-white shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--ncx-purple-300), var(--ncx-purple-700))' }}
                    >
                      {token.symbol[0]}
                    </span>
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-ncx-text text-sm truncate">{token.symbol}</div>
                    <div className="text-xs text-ncx-text-muted truncate">{token.name}</div>
                  </div>
                  <div className="ncx-num text-sm text-ncx-text shrink-0">
                    {bal ? bal.formatted : '—'}
                  </div>
                </button>
              )
            })
          ) : (
            <div className="py-12 text-center text-ncx-text-muted text-sm">
              No tokens found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
