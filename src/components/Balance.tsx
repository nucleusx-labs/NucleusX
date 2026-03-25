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
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1] mb-1">Balance</p>
      <div className="flex items-baseline gap-2">
        <span className="font-bold tracking-tight text-[#F2F2F2] text-2xl">{balance || '---'}</span>
        <span className="text-xs font-bold uppercase text-[#A1A1A1]">{symbol}</span>
      </div>
    </div>
  )
}
