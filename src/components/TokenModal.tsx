import { X, Search, Loader2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useAtom, useSelector } from '@xstate/store/react'
import { dexStore, isWhitelistedTokenAddress, selectTokenList } from '../store/dexStore'
import type { Token } from '../store/dexStore'
import type { TokenBalance } from '../hooks/useTokenBalances'
import { fetchTokenMetadata, isHexAddress, ZERO_SS58 } from '../utils/liquidity'
import sdk from '../utils/sdk'
import { toast } from '../store/toastStore'
import TokenIcon from './TokenIcon'
import { selectedAccount } from '../hooks/useConnect'

export type { Token }

interface TokenModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectToken: (token: Token) => void
  balances?: Map<string, TokenBalance>
  disabledAddresses?: string[]
}

type LookupStatus = 'idle' | 'loading' | 'ready' | 'error'

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

export default function TokenModal({ isOpen, onClose, onSelectToken, balances, disabledAddresses }: TokenModalProps) {
  const account = useAtom(selectedAccount)
  const [searchQuery, setSearchQuery] = useState('')
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle')
  const [lookupToken, setLookupToken] = useState<Token | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const tokenList = useSelector(dexStore, selectTokenList)

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const normalizedQuery = searchQuery.trim()
  const isAddressSearch = isHexAddress(normalizedQuery)

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setLookupStatus('idle')
      setLookupToken(null)
      setLookupError(null)
      return
    }

    if (!isAddressSearch) {
      setLookupStatus('idle')
      setLookupToken(null)
      setLookupError(null)
      return
    }

    const existing = tokenList.find(token =>
      token.address.toLowerCase() === normalizedQuery.toLowerCase(),
    )
    if (existing) {
      setLookupStatus('ready')
      setLookupToken(existing)
      setLookupError(null)
      return
    }

    let cancelled = false
    setLookupStatus('loading')
    setLookupToken(null)
    setLookupError(null)

    async function resolveToken() {
      try {
        const { api } = sdk('qf_network')
        const token = await fetchTokenMetadata(
          api,
          normalizedQuery as `0x${string}`,
          tokenList,
          account?.address ?? ZERO_SS58,
        )
        if (cancelled) return
        setLookupStatus('ready')
        setLookupToken(token)
      }
      catch (err) {
        if (cancelled) return
        setLookupStatus('error')
        setLookupToken(null)
        setLookupError(err instanceof Error ? err.message : 'Token lookup failed')
      }
    }

    resolveToken()
    return () => { cancelled = true }
  }, [account?.address, isOpen, isAddressSearch, normalizedQuery, tokenList])

  const filteredTokens = useMemo(() => tokenList.filter(t =>
    t.symbol.toLowerCase().includes(normalizedQuery.toLowerCase())
    || t.name.toLowerCase().includes(normalizedQuery.toLowerCase())
    || t.address.toLowerCase().includes(normalizedQuery.toLowerCase()),
  ), [normalizedQuery, tokenList])

  function handleSelect(token: Token) {
    onSelectToken(token)
    onClose()
  }

  function handleAddLocal(token: Token) {
    dexStore.send({ type: 'tokenList.add', token: { ...token, isCustom: true } })
    toast.success(`Added ${token.symbol}`, token.address)
    handleSelect({ ...token, isCustom: true })
  }

  function handleRemoveLocal(token: Token, event?: MouseEvent<HTMLButtonElement>) {
    event?.preventDefault()
    event?.stopPropagation()

    dexStore.send({ type: 'tokenList.remove', tokenAddress: token.address })
    toast.info(`Removed ${token.symbol}`, 'Deleted from your local token list')

    if (lookupToken?.address.toLowerCase() === token.address.toLowerCase()) {
      setLookupToken({ ...token, isCustom: false })
    }
  }

  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  const lookupIsWhitelisted = lookupToken ? isWhitelistedTokenAddress(lookupToken.address) : false
  const lookupIsInList = lookupToken
    ? tokenList.some(token => token.address.toLowerCase() === lookupToken.address.toLowerCase())
    : false

  return createPortal(
    <div className="fixed inset-0 z-[140] isolate overscroll-contain flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0"
        style={{
          background: 'color-mix(in srgb, var(--ncx-ink-0) 94%, var(--ncx-bg))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        onClick={onClose}
      />

      <div
        className="relative w-full sm:max-w-md ncx-modal flex flex-col max-h-[85vh] sm:max-h-[80vh] rounded-t-2xl sm:rounded-3xl"
        style={{ animation: 'fadeUp 0.32s var(--ncx-ease-out)', background: 'var(--ncx-surface-1)' }}
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

          {isAddressSearch && (
            <div
              className="mt-3 rounded-2xl border p-3"
              style={{ background: 'var(--ncx-surface-2)', borderColor: 'var(--ncx-border)' }}
            >
              {lookupStatus === 'loading' && (
                <div className="flex items-center gap-2 text-sm text-ncx-text-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-ncx-purple-300" />
                  Looking up token metadata…
                </div>
              )}

              {lookupStatus === 'error' && (
                <div className="text-sm text-ncx-loss">
                  {lookupError ?? 'Token lookup failed'}
                </div>
              )}

              {lookupStatus === 'ready' && lookupToken && (
                <div className="flex items-start gap-3">
                  <TokenIcon token={lookupToken} className="w-10 h-10 rounded-full" fallbackClassName="text-[13px]" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="font-semibold text-ncx-text text-sm">{lookupToken.symbol}</div>
                      <span
                        className="ncx-num text-[10px] uppercase tracking-[0.12em] px-2 py-1 rounded-full"
                        style={{
                          background: lookupIsWhitelisted ? 'var(--ncx-gain-bg)' : 'var(--ncx-surface-3)',
                          color: lookupIsWhitelisted ? 'var(--ncx-gain)' : 'var(--ncx-text-muted)',
                        }}
                      >
                        {lookupIsWhitelisted ? 'Whitelisted' : lookupIsInList ? 'Local token' : 'Found on-chain'}
                      </span>
                    </div>
                    <div className="text-xs text-ncx-text-muted truncate">{lookupToken.name}</div>
                    <div className="ncx-num text-[11px] text-ncx-text-subtle mt-1 break-all">
                      {lookupToken.address}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSelect(lookupToken)}
                        className="btn-ncx btn-ncx-secondary"
                        style={{ padding: '0.55rem 0.9rem', fontSize: '0.75rem' }}
                      >
                        Use token
                      </button>

                      {!lookupIsWhitelisted && !lookupIsInList && (
                        <button
                          onClick={() => handleAddLocal(lookupToken)}
                          className="btn-ncx btn-ncx-primary"
                          style={{ padding: '0.55rem 0.9rem', fontSize: '0.75rem' }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add locally
                        </button>
                      )}

                      {!lookupIsWhitelisted && lookupIsInList && lookupToken.isCustom && (
                        <button
                          onClick={event => handleRemoveLocal(lookupToken, event)}
                          className="btn-ncx btn-ncx-secondary"
                          style={{ padding: '0.55rem 0.9rem', fontSize: '0.75rem' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remove local
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          {filteredTokens.length > 0 ? (
            filteredTokens.map((token) => {
              const bal = balances?.get(token.address.toLowerCase())
              const disabled = !!disabledAddresses?.some(a => a.toLowerCase() === token.address.toLowerCase())
              return (
                <div
                  key={token.address}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors duration-150 ${
                    disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-ncx-wash'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => !disabled && handleSelect(token)}
                    disabled={disabled}
                    className="flex flex-1 items-center gap-3 text-left min-w-0"
                  >
                    <TokenIcon token={token} className="w-9 h-9 rounded-full" fallbackClassName="text-[13px]" />
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-ncx-text text-sm truncate">{token.symbol}</div>
                        {token.isCustom && (
                          <span className="ncx-num text-[10px] uppercase tracking-[0.1em] text-ncx-text-subtle">Local</span>
                        )}
                      </div>
                      <div className="text-xs text-ncx-text-muted truncate">{token.name}</div>
                      <div className="ncx-num text-[11px] text-ncx-text-subtle truncate">{truncateAddress(token.address)}</div>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="ncx-num text-sm text-ncx-text min-w-[3.5rem] text-right">
                      {bal ? bal.formatted : '—'}
                    </div>
                    {token.isCustom && !disabled && (
                      <button
                        type="button"
                        onClick={event => handleRemoveLocal(token, event)}
                        className="p-2 rounded-full text-ncx-text-subtle hover:text-ncx-loss hover:bg-ncx-loss-bg transition-colors duration-150"
                        aria-label={`Remove ${token.symbol} from local token list`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="py-12 text-center text-ncx-text-muted text-sm">
              {isAddressSearch
                ? 'No saved token matches that address yet.'
                : 'No tokens found.'}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
