import type { Prefix } from '../utils/sdk'
import { useCurrentBlock } from '../hooks/useCurrentBlock'
import { buyTokenUrl, explorerAccount } from '../utils/formatters'
import Balance from './Balance'
import SignTransaction from './SignTransaction'

interface AccountCardProps {
  chainKey: Prefix
  address?: string
}

export default function AccountCard({ chainKey, address }: AccountCardProps) {
  const { name, currentBlock, isConnected } = useCurrentBlock(chainKey)

  return (
    <div className="ncx-card p-6 transition-all duration-300 hover:border-ncx-purple-500/50">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-ncx-text text-sm">{name || '---'}</h3>
        {isConnected && (
          <span className="ncx-chip" style={{ background: 'var(--ncx-gain-bg)', color: 'var(--ncx-gain)', borderColor: 'color-mix(in srgb, var(--ncx-gain) 25%, transparent)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-ncx-gain" style={{ animation: 'ncx-pulse-dot 2s ease-in-out infinite' }} />
            Live
          </span>
        )}
      </div>

      <div className="mb-5">
        <p className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-subtle mb-1">Current block</p>
        <div key={currentBlock} className="ncx-num text-lg text-ncx-text">
          #{currentBlock ? currentBlock.toLocaleString() : '---'}
        </div>
      </div>

      <div className="border-t border-ncx-border pt-4">
        {address ? (
          <Balance key={address} address={address} chainKey={chainKey} />
        ) : (
          <div className="flex flex-col items-center py-3 text-center">
            <span className="icon-[mdi--wallet-plus] text-2xl text-ncx-text-subtle mb-2" />
            <p className="text-xs text-ncx-text-muted">Connect a wallet to see balances</p>
          </div>
        )}
      </div>

      {address && (
        <div className="mt-5 border-t border-ncx-border pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <a
              href={buyTokenUrl(chainKey, address)}
              target="_blank"
              rel="noopener noreferrer"
              className="ncx-num text-[10px] uppercase tracking-[0.12em] px-3 py-2 rounded-full border border-ncx-border bg-ncx-surface-2 text-ncx-text-muted hover:border-ncx-purple-500 hover:text-ncx-text hover:bg-ncx-wash transition-all duration-200 text-center"
            >
              Get tokens
            </a>
            <a
              href={explorerAccount(chainKey, address)}
              target="_blank"
              rel="noopener noreferrer"
              className="ncx-num text-[10px] uppercase tracking-[0.12em] px-3 py-2 rounded-full border border-ncx-border bg-ncx-surface-2 text-ncx-text-muted hover:border-ncx-purple-500 hover:text-ncx-text hover:bg-ncx-wash transition-all duration-200 text-center flex items-center justify-center gap-1"
            >
              <span className="icon-[mdi--open-in-new]" />
              Explorer
            </a>
          </div>
          {isConnected ? (
            <SignTransaction chainKey={chainKey} />
          ) : (
            <div className="flex items-center justify-center gap-2 ncx-num text-[10px] uppercase tracking-[0.12em] text-ncx-text-subtle">
              <span className="icon-[mdi--link-off]" />
              Chain not connected
            </div>
          )}
        </div>
      )}
    </div>
  )
}
