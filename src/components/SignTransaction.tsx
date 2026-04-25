import type { Prefix } from '../utils/sdk'
import { useConnect } from '../hooks/useConnect'
import { useTransaction } from '../hooks/useTransaction'
import { explorerDetail } from '../utils/formatters'

interface SignTransactionProps {
  chainKey: Prefix
}

export default function SignTransaction({ chainKey }: SignTransactionProps) {
  const { selectedAccount } = useConnect()
  const { isProcessing, result, txHash, signRemarkTransaction } = useTransaction()

  async function signTransaction() {
    if (!selectedAccount) return
    await signRemarkTransaction(chainKey, 'Hello from create-dot-app')
  }

  const isError = result?.includes('Error')

  return (
    <div className="space-y-3">
      {isProcessing && (
        <div
          className="p-3 rounded-2xl flex items-center gap-2 text-sm"
          style={{ background: 'var(--ncx-wash)', border: '1px solid color-mix(in srgb, var(--ncx-purple-500) 25%, transparent)', color: 'var(--ncx-text-muted)' }}
        >
          <span className="icon-[mdi--loading] animate-spin text-ncx-purple-300" />
          Processing transaction…
        </div>
      )}

      {result && (
        <div
          className="p-3 rounded-2xl flex items-center gap-2 text-sm font-medium"
          style={{
            background: isError ? 'var(--ncx-loss-bg)' : 'var(--ncx-gain-bg)',
            border: `1px solid color-mix(in srgb, ${isError ? 'var(--ncx-loss)' : 'var(--ncx-gain)'} 30%, transparent)`,
            color: isError ? 'var(--ncx-loss)' : 'var(--ncx-gain)',
          }}
        >
          <span className={isError ? 'icon-[mdi--alert-circle]' : 'icon-[mdi--check-circle]'} />
          {result}
        </div>
      )}

      {txHash && (
        <div
          className="p-3 rounded-2xl"
          style={{ background: 'var(--ncx-surface-2)', border: '1px solid var(--ncx-border)' }}
        >
          <p className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted mb-1">Transaction hash</p>
          <p className="ncx-num text-xs text-ncx-text break-all mb-2">{txHash}</p>
          <a
            href={explorerDetail(chainKey, txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-purple-300 hover:text-ncx-text transition-colors duration-150"
          >
            View on Subscan <span className="icon-[mdi--open-in-new]" />
          </a>
        </div>
      )}

      {selectedAccount ? (
        <button
          type="button"
          disabled={isProcessing}
          onClick={signTransaction}
          className="btn-ncx btn-ncx-primary w-full"
        >
          {isProcessing && <span className="icon-[mdi--loading] animate-spin" />}
          {isProcessing ? 'Processing…' : 'Sign transaction'}
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted py-2">
          <span className="icon-[mdi--wallet-outline]" />
          Connect wallet to sign
        </div>
      )}
    </div>
  )
}
