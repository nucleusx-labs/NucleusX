import { useEffect, useState } from 'react'
import { callContract, decodeContractResult, encodeContractCall } from '../utils/revive'
import { ERC20_ABI } from '../utils/contracts'
import { dexStore, NATIVE_TOKEN_ADDRESS } from '../store/dexStore'
import sdk from '../utils/sdk'
import type { Address } from 'viem'

// Fallback SS58 origin for read-only calls when no account is connected.
// Balances will be 0 anyway without a real evmAddress.
const ZERO_SS58 = '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM'

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
  ss58Origin?: string,
): Map<string, TokenBalance> {
  const [balances, setBalances] = useState<Map<string, TokenBalance>>(new Map())

  const validAddresses = tokenAddresses.filter((a): a is string => !!a)
  const addressKey = validAddresses.join(',')

  useEffect(() => {
    if (validAddresses.length === 0) return
    const hasOnlyNative = validAddresses.every(a => a.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase())
    if (!evmAddress && !hasOnlyNative) return

    const origin = ss58Origin ?? ZERO_SS58
    const resolvedEvmAddress = evmAddress
    let cancelled = false

    async function fetchBalances() {
      const { api } = sdk('qf_network')
      const result = new Map<string, TokenBalance>()

      await Promise.all(
        validAddresses.map(async (tokenAddress) => {
          try {
            if (tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()) {
              // Native QF token — fetch via substrate System.Account
              if (!ss58Origin || ss58Origin === ZERO_SS58) {
                result.set(tokenAddress.toLowerCase(), { balance: 0n, decimals: 18, formatted: '0.0000' })
                return
              }
              const { client } = sdk('qf_network')
              const [accountData, chainSpec] = await Promise.all([
                api.query.System.Account.getValue(ss58Origin),
                client.getChainSpecData(),
              ])
              const decimals = Number(chainSpec.properties.tokenDecimals) || 18
              const balance = BigInt(String(accountData.data.free))
              const formatted = formatBigIntBalance(balance, decimals)
              result.set(tokenAddress.toLowerCase(), { balance, decimals, formatted })
              return
            }

            const addr = tokenAddress as Address
            const decimalsCalldata = encodeContractCall(ERC20_ABI, 'decimals')
            const balanceCalldata = encodeContractCall(ERC20_ABI, 'balanceOf', [resolvedEvmAddress!])

            const [decimalsRes, balanceRes] = await Promise.all([
              callContract(api, { origin, dest: addr, value: 0n, calldata: decimalsCalldata }),
              callContract(api, { origin, dest: addr, value: 0n, calldata: balanceCalldata }),
            ])

            const decimals = decimalsRes.result.ok
              ? Number(decodeContractResult(ERC20_ABI, 'decimals', decimalsRes.result.ok.data))
              : 18

            const balance = balanceRes.result.ok
              ? BigInt(String(decodeContractResult(ERC20_ABI, 'balanceOf', balanceRes.result.ok.data)))
              : 0n

            const formatted = formatBigIntBalance(balance, decimals)
            result.set(tokenAddress.toLowerCase(), { balance, decimals, formatted })
          }
          catch (err) {
            console.error(`Failed to fetch balance for token ${tokenAddress}:`, err)
            result.set(tokenAddress.toLowerCase(), { balance: 0n, decimals: 18, formatted: '0.0000' })
          }
        }),
      )

      if (!cancelled) {
        setBalances(result)
        const storeBalances: Record<string, TokenBalance> = {}
        result.forEach((v, k) => { storeBalances[k] = v })
        dexStore.send({ type: 'balances.set', balances: storeBalances })
      }
    }

    fetchBalances()
    return () => { cancelled = true }
  }, [evmAddress, addressKey, ss58Origin])

  return balances
}
