import { useSelector } from '@xstate/store/react'
import { useEffect, useMemo, useState } from 'react'
import { dexStore, selectTokenList } from '../store/dexStore'
import { CONTRACTS, FACTORY_ABI, PAIR_ABI } from '../utils/contracts'
import { ethRpcClient, isZeroAddress } from '../utils/liquidity'

interface HomepageMetrics {
  supportedAssets: number
  totalPairs: number
  activePools: number
  traders: number
}

const DEFAULT_TRADERS = 100

export function useHomepageMetrics() {
  const tokenList = useSelector(dexStore, selectTokenList)
  const supportedAssets = useMemo(
    () => tokenList.filter(token => !token.isCustom).length,
    [tokenList],
  )

  const [metrics, setMetrics] = useState<HomepageMetrics>({
    supportedAssets,
    totalPairs: 0,
    activePools: 0,
    traders: DEFAULT_TRADERS,
  })

  useEffect(() => {
    setMetrics(prev => ({ ...prev, supportedAssets }))
  }, [supportedAssets])

  useEffect(() => {
    let cancelled = false

    async function fetchMetrics() {
      try {
        const totalPairs = Number(await ethRpcClient.readContract({
          address: CONTRACTS.UniswapV2Factory,
          abi: FACTORY_ABI,
          functionName: 'allPairsLength',
        }))

        if (totalPairs <= 0) {
          if (!cancelled) {
            setMetrics({
              supportedAssets,
              totalPairs: 0,
              activePools: 0,
              traders: DEFAULT_TRADERS,
            })
          }
          return
        }

        const pairAddresses = (
          await Promise.all(
            Array.from({ length: totalPairs }, (_, index) =>
              ethRpcClient.readContract({
                address: CONTRACTS.UniswapV2Factory,
                abi: FACTORY_ABI,
                functionName: 'allPairs',
                args: [BigInt(index)],
              }).catch(() => null),
            ),
          )
        ).flatMap((pairAddress) => {
          if (!pairAddress || isZeroAddress(pairAddress)) return []
          return [pairAddress]
        })

        const reserveResults = await Promise.all(
          pairAddresses.map(pairAddress =>
            ethRpcClient.readContract({
              address: pairAddress,
              abi: PAIR_ABI,
              functionName: 'getReserves',
            }).catch(() => null),
          ),
        )

        const activePools = reserveResults.reduce((count, reserves) => {
          if (!reserves) return count
          return reserves[0] > 0n && reserves[1] > 0n ? count + 1 : count
        }, 0)

        if (!cancelled) {
          setMetrics({
            supportedAssets,
            totalPairs: pairAddresses.length,
            activePools,
            traders: DEFAULT_TRADERS,
          })
        }
      }
      catch (err) {
        console.error('[useHomepageMetrics] Failed to fetch homepage metrics', err)
        if (!cancelled) {
          setMetrics({
            supportedAssets,
            totalPairs: 0,
            activePools: 0,
            traders: DEFAULT_TRADERS,
          })
        }
      }
    }

    fetchMetrics()

    return () => { cancelled = true }
  }, [supportedAssets])

  return metrics
}
