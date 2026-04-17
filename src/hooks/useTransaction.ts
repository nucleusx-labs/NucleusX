import type { Prefix } from '../utils/sdk'
import { useState } from 'react'
import { createRemarkTransaction, polkadotSigner } from '../utils/sdk-interface'
import { toast } from '../store/toastStore'
import { useConnect } from './useConnect'

export function useTransaction() {
  const { selectedAccount } = useConnect()

  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState('')
  const [txHash, setTxHash] = useState('')

  const signRemarkTransaction = async (chainPrefix: Prefix, message: string) => {
    if (!selectedAccount) {
      setResult('Error: No account selected')
      return
    }

    setIsProcessing(true)
    setResult('')
    setTxHash('')

    try {
      const signer = await polkadotSigner()

      if (!signer) {
        throw new Error('No signer found')
      }

      toast.info('Signing transaction', 'Confirm in your wallet')

      createRemarkTransaction(chainPrefix, message, selectedAccount.address, signer, {
        onTxHash: (hash) => {
          setTxHash(hash)
          toast.success('Transaction submitted', hash)
        },
        onFinalized: () => {
          setResult('Transaction successful!')
          setIsProcessing(false)
          toast.success('Transaction finalized')
        },
        onError: (error) => {
          setResult(`Error: ${error}`)
          setIsProcessing(false)
          toast.error('Transaction failed', error)
        },
      })
    }
    catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setResult(`Error: ${msg}`)
      setIsProcessing(false)
      toast.error('Transaction failed', msg)
    }
  }

  return {
    isProcessing,
    result,
    txHash,
    signRemarkTransaction,
  }
}
