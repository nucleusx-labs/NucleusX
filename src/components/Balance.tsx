import type { Prefix } from '../utils/sdk'
import { useEffect, useState } from 'react'
import { getBalance } from '../utils/sdk-interface'

interface BalanceProps {
  address?: string
  chainKey: Prefix
}

export default function Balance({ address, chainKey }: BalanceProps) {
  const [balance, setBalance] = useState('')
  const [symbol, setSymbol] = useState('')

  useEffect(() => {
    if (!address) return
    let ignore = false
    const fetchBalance = async () => {
      const { balance, symbol } = await getBalance(chainKey, address)
      if (!ignore) { setBalance(balance); setSymbol(symbol) }
    }
    fetchBalance()
    return () => { ignore = true }
  }, [address, chainKey])

  return (
    <div>
      <p className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted mb-1">Balance</p>
      <div className="flex items-baseline gap-2">
        <span className="ncx-num text-2xl font-medium text-ncx-text">{balance || '---'}</span>
        <span className="text-xs font-medium text-ncx-text-muted">{symbol}</span>
      </div>
    </div>
  )
}
