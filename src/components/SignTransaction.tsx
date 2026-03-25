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
      {isProcessing && (
        <div className="mb-4 p-3 border border-[#7B3FE4] bg-[#7B3FE4]/10 flex items-center gap-2">
          <span className="icon-[mdi--loading] animate-spin text-[#7B3FE4]" />
          <span className="text-sm font-bold uppercase text-[#A1A1A1]">Processing transaction...</span>
        </div>
      )}

      {result && (
        <div className={`mb-4 p-3 border flex items-center gap-2 ${result.includes('Error') ? 'border-[#FF4040] bg-[#FF4040]/10' : 'border-[#00D084] bg-[#00D084]/10'}`}>
          {result.includes('Error')
            ? <span className="icon-[mdi--alert-circle] text-[#FF4040]" />
            : <span className="icon-[mdi--check-circle] text-[#00D084]" />
          }
          <span className={`text-sm font-bold ${result.includes('Error') ? 'text-[#FF4040]' : 'text-[#00D084]'}`}>{result}</span>
        </div>
      )}

      {txHash && (
        <div className="mb-4 p-3 border border-[#2D0A5B]">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1] mb-2">Transaction Hash</p>
          <p className="text-sm text-[#F2F2F2] font-bold break-all mb-2 truncate">{txHash}</p>
          <a
            href={explorerDetail(chainKey, txHash)}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150 font-bold uppercase tracking-widest underline"
          >
            View on Subscan <span className="icon-[mdi--open-in-new]" />
          </a>
        </div>
      )}

      {selectedAccount ? (
        <button
          type="button"
          disabled={isProcessing}
          className="w-full py-3 bg-[#7B3FE4] text-[#F2F2F2] text-sm font-bold uppercase tracking-widest hover:bg-[#2D0A5B] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          onClick={signTransaction}
        >
          {isProcessing && <span className="icon-[mdi--loading] animate-spin" />}
          {isProcessing ? 'Processing...' : 'Sign Transaction'}
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
          <span className="icon-[mdi--wallet-outline]" />
          Connect wallet to sign transactions
        </div>
      )}
    </div>
  )
}
