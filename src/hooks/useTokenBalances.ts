import { useEffect, useState } from 'react'
import { createPublicClient, http } from 'viem'
import { ERC20_ABI } from '../utils/contracts'

const qfPublicClient = createPublicClient({
  chain: {
    id: 3426,
    name: 'QF Network',
    nativeCurrency: { name: 'QF', symbol: 'QF', decimals: 18 },
    rpcUrls: { default: { http: ['https://archive.mainnet.qfnode.net/eth'] } },
  },
  transport: http('https://archive.mainnet.qfnode.net/eth'),
})

function formatBigIntBalance(balance: bigint, decimals: number): string {
  if (decimals === 0) return balance.toString()
  const divisor = 10n ** BigInt(decimals)
  const whole = balance / divisor
  const frac = (balance % divisor).toString().padStart(decimals, '0').slice(0, 4)
  return `${whole}.${frac}`
}

export interface TokenBalance {
  balance: bigint
  decimals: number
  formatted: string
}

export function useTokenBalances(
  evmAddress: `0x${string}` | undefined,
  tokenAddresses: (string | undefined)[],
): Map<string, TokenBalance> {
  const [balances, setBalances] = useState<Map<string, TokenBalance>>(new Map())

  const validAddresses = tokenAddresses.filter((a): a is string => !!a)
  const addressKey = validAddresses.join(',')

  useEffect(() => {
    if (!evmAddress || validAddresses.length === 0) return

    const resolvedEvmAddress = evmAddress
    let cancelled = false

    async function fetchBalances() {
      const result = new Map<string, TokenBalance>()

      await Promise.all(validAddresses.map(async (tokenAddress) => {
        try {
          const addr = tokenAddress as `0x${string}`

          const [decimals, balance] = await Promise.all([
            qfPublicClient.readContract({
              address: addr,
              abi: ERC20_ABI,
              functionName: 'decimals',
            }) as Promise<number>,
            qfPublicClient.readContract({
              address: addr,
              abi: ERC20_ABI,
              functionName: 'balanceOf',
              args: [resolvedEvmAddress],
            }) as Promise<bigint>,
          ])

          const formatted = formatBigIntBalance(balance, decimals)
          result.set(tokenAddress.toLowerCase(), { balance, decimals, formatted })
        }
        catch (err) {
          console.error(`Failed to fetch balance for token ${tokenAddress}:`, err)
          result.set(tokenAddress.toLowerCase(), { balance: 0n, decimals: 18, formatted: '0.0000' })
        }
      }))

      if (!cancelled) setBalances(result)
    }

    fetchBalances()
    return () => { cancelled = true }
  }, [evmAddress, addressKey])

  return balances
}
