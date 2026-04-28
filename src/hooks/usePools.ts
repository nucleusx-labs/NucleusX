import { useAtom, useSelector } from '@xstate/store/react'
import { useEffect, useState } from 'react'
import { selectedAccount } from '../hooks/useConnect'
import { useEvmAddress } from '../hooks/useEvmAddress'
import type { Token } from '../store/dexStore'
import { dexStore, selectTokenList } from '../store/dexStore'
import { CONTRACTS, FACTORY_ABI } from '../utils/contracts'
import { fetchPoolSnapshot, formatTokenAmount, isZeroAddress, ZERO_SS58 } from '../utils/liquidity'
import { callContract, decodeContractResult, encodeContractCall } from '../utils/revive'
import sdk from '../utils/sdk'

export interface Pool {
  tokenA: Token
  tokenB: Token
  actualTokenA: `0x${string}`
  actualTokenB: `0x${string}`
  pairAddress: `0x${string}`
  tvl: string
  volume24h: string
  fee: string
  userLiquidity: bigint
  userLiquidityFormatted: string
  userSharePercent: string
  hasPosition: boolean
}

function formatSharePercent(liquidity: bigint, totalSupply: bigint): string {
  if (liquidity <= 0n || totalSupply <= 0n) return '0.00%'

  const scaled = (liquidity * 10000n * 100n) / totalSupply
  const whole = scaled / 100n
  const fraction = (scaled % 100n).toString().padStart(2, '0')
  return `${whole}.${fraction}%`
}

export function usePools() {
  const account = useAtom(selectedAccount)
  const evmAddress = useEvmAddress(account?.address)
  const tokenList = useSelector(dexStore, selectTokenList)

  const [pools, setPools] = useState<Pool[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    async function fetchPools() {
      try {
        const { api } = sdk('qf_network')
        const origin = account?.address ?? ZERO_SS58

        const lengthRes = await callContract(api, {
          origin,
          dest: CONTRACTS.UniswapV2Factory,
          value: 0n,
          calldata: encodeContractCall(FACTORY_ABI, 'allPairsLength', []),
        })

        if (!lengthRes.result.ok) {
          throw new Error('Failed to read factory pair count')
        }

        const allPairsLength = Number(
          decodeContractResult(FACTORY_ABI, 'allPairsLength', lengthRes.result.ok.data),
        )

        if (allPairsLength === 0) {
          if (!cancelled) setPools([])
          return
        }

        const pairResponses = await Promise.all(
          Array.from({ length: allPairsLength }, (_, index) =>
            callContract(api, {
              origin,
              dest: CONTRACTS.UniswapV2Factory,
              value: 0n,
              calldata: encodeContractCall(FACTORY_ABI, 'allPairs', [BigInt(index)]),
            }).catch(() => null),
          ),
        )

        const pairAddresses = pairResponses.flatMap((response) => {
          if (!response?.result.ok) return []
          const pairAddress = decodeContractResult(FACTORY_ABI, 'allPairs', response.result.ok.data) as `0x${string}`
          return isZeroAddress(pairAddress) ? [] : [pairAddress]
        })

        const snapshots = await Promise.allSettled(
          pairAddresses.map(pairAddress =>
            fetchPoolSnapshot(api, pairAddress, tokenList, origin, evmAddress),
          ),
        )

        const foundPools = snapshots.flatMap((snapshot): Pool[] => {
          if (snapshot.status !== 'fulfilled') return []

          const pool = snapshot.value
          return [{
            tokenA: pool.token0,
            tokenB: pool.token1,
            actualTokenA: pool.actualToken0,
            actualTokenB: pool.actualToken1,
            pairAddress: pool.pairAddress,
            tvl: '-',
            volume24h: '-',
            fee: '0.3%',
            userLiquidity: pool.userLiquidity,
            userLiquidityFormatted: formatTokenAmount(pool.userLiquidity, 18),
            userSharePercent: formatSharePercent(pool.userLiquidity, pool.totalSupply),
            hasPosition: pool.userLiquidity > 0n,
          }]
        })

        foundPools.sort((a, b) => {
          if (a.hasPosition !== b.hasPosition) return a.hasPosition ? -1 : 1

          const pairA = `${a.tokenA.symbol}/${a.tokenB.symbol}`
          const pairB = `${b.tokenA.symbol}/${b.tokenB.symbol}`
          return pairA.localeCompare(pairB)
        })

        if (!cancelled) setPools(foundPools)
      }
      catch (err) {
        console.error('[usePools] Failed to fetch pools', err)
        if (!cancelled) setPools([])
      }
      finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchPools()

    return () => { cancelled = true }
  }, [account?.address, evmAddress, tokenList])

  return { pools, isLoading }
}
