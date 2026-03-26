import { useEffect, useState } from 'react'
import { ERC20_ABI } from '../utils/contracts'
import { decodeContractResult, encodeContractCall } from '../utils/revive'
import { reviveCall } from '../utils/sdk-interface'

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
          const dest = tokenAddress as `0x${string}`

          const decimalsCalldata = encodeContractCall(ERC20_ABI, 'decimals')
          const decimalsRes = await reviveCall('qf_network', { dest, value: 0n, calldata: decimalsCalldata })
          const decimals = decimalsRes.result.ok
            ? Number(decodeContractResult(ERC20_ABI, 'decimals', decimalsRes.result.ok.data as `0x${string}`))
            : 18

          const balanceCalldata = encodeContractCall(ERC20_ABI, 'balanceOf', [resolvedEvmAddress])
          const balanceRes = await reviveCall('qf_network', { dest, value: 0n, calldata: balanceCalldata })
          const balance = balanceRes.result.ok
            ? BigInt(String(decodeContractResult(ERC20_ABI, 'balanceOf', balanceRes.result.ok.data as `0x${string}`)))
            : 0n

          const formatted = (Number(balance) / 10 ** decimals).toFixed(4)
          result.set(tokenAddress.toLowerCase(), { balance, decimals, formatted })
        }
        catch {
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
