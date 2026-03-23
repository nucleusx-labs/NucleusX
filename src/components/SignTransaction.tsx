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

  return (
    <div>
      {/* Orange for processing/pending state */}
      {isProcessing && (
        <div className="mb-4 p-3 border-[2px] border-brutalist-orange bg-[var(--brutalist-orange-10)] flex items-center gap-2">
          <span className="icon-[mdi--loading] animate-spin text-brutalist-orange" />
          <span className="text-sm font-black uppercase text-brutalist-panel-text">Processing transaction...</span>
        </div>
      )}

      {/* Teal for success, red for error */}
      {result && (
        <div className={`mb-4 p-3 border-[2px] flex items-center gap-2 ${result.includes('Error') ? 'border-red-500 bg-red-500/10' : 'border-brutalist-teal bg-[var(--brutalist-teal-10)]'}`}>
          {result.includes('Error')
            ? <span className="icon-[mdi--alert-circle] text-red-500" />
            : <span className="icon-[mdi--check-circle] text-brutalist-teal" />
          }
          <span className={`text-sm font-bold ${result.includes('Error') ? 'text-red-500' : 'text-brutalist-teal'}`}>{result}</span>
        </div>
      )}

      {txHash && (
        <div className="mb-4 p-3 border-[2px] border-black">
          <div className="text-xs text-brutalist-text-muted font-black uppercase tracking-widest mb-2">Transaction Hash</div>
          <div className="text-sm text-brutalist-panel-text font-mono font-bold break-all mb-2 truncate">{txHash}</div>
          <a
            href={explorerDetail(chainKey, txHash)}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-brutalist-teal hover:text-brutalist-orange transition-colors duration-75 font-black uppercase tracking-widest"
          >
            View on Subscan <span className="icon-[mdi--open-in-new]" />
          </a>
        </div>
      )}

      {selectedAccount ? (
        <button
          type="button"
          disabled={isProcessing}
          className="btn-brutal w-full text-sm"
          onClick={signTransaction}
        >
          {isProcessing && <span className="icon-[mdi--loading] animate-spin" />}
          {isProcessing ? 'Processing...' : 'Sign Transaction'}
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 text-xs text-brutalist-text-muted font-black uppercase tracking-widest">
          <span className="icon-[mdi--wallet-outline]" />
          Connect wallet to sign transactions
        </div>
      )}
    </div>
  )
}
