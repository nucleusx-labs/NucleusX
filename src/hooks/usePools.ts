import { useAtom, useSelector } from '@xstate/store/react'
import { useEffect, useState } from 'react'
import { selectedAccount } from '../hooks/useConnect'
import type { Token } from '../store/dexStore'
import { dexStore, NATIVE_TOKEN_ADDRESS, selectTokenList } from '../store/dexStore'
import { CONTRACTS, FACTORY_ABI, TOKENS } from '../utils/contracts'
import { callContract, decodeContractResult, encodeContractCall } from '../utils/revive'
import sdk from '../utils/sdk'

const ZERO_SS58 = '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM'

export interface Pool {
  tokenA: Token
  tokenB: Token
  pairAddress: string
  tvl: string
  volume24h: string
  fee: string
}

export function usePools() {
  const account = useAtom(selectedAccount)
  const tokenList = useSelector(dexStore, selectTokenList)

  const [pools, setPools] = useState<Pool[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (tokenList.length < 2) {
      setPools([])
      return
    }

    let cancelled = false
    setIsLoading(true)

    async function fetchPools() {
      try {
        const { api } = sdk('qf_network')
        const origin = account?.address ?? ZERO_SS58

        const combinations: [Token, Token][] = []
        for (let i = 0; i < tokenList.length; i++) {
          for (let j = i + 1; j < tokenList.length; j++) {
            const tokenA = tokenList[i]
            const tokenB = tokenList[j]
            if (tokenA.address.toLowerCase() === tokenB.address.toLowerCase()) continue
            combinations.push([tokenA, tokenB])
          }
        }

        const foundPools: Pool[] = []

        await Promise.allSettled(
          combinations.map(async ([tokenA, tokenB]) => {
            const tAAddress = tokenA.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() ? TOKENS.WQF : tokenA.address
            const tBAddress = tokenB.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() ? TOKENS.WQF : tokenB.address

            if (tAAddress.toLowerCase() === tBAddress.toLowerCase()) return

            const calldata = encodeContractCall(FACTORY_ABI, 'getPair', [tAAddress, tBAddress])
            const res = await callContract(api, {
              origin,
              dest: CONTRACTS.UniswapV2Factory,
              value: 0n,
              calldata,
            }).catch(() => null)

            if (!res?.result.ok) return

            const pairAddressRaw = decodeContractResult(FACTORY_ABI, 'getPair', res.result.ok.data) as string
            const pairAddress = pairAddressRaw.toLowerCase()
            if (!pairAddress || /^0x0+$/.test(pairAddress)) return

            foundPools.push({
              tokenA,
              tokenB,
              pairAddress,
              tvl: '-',
              volume24h: '-',
              fee: '0.3%',
            })
          }),
        )

        foundPools.sort((a, b) => {
          const pairA = `${a.tokenA.symbol}/${a.tokenB.symbol}`
          const pairB = `${b.tokenA.symbol}/${b.tokenB.symbol}`
          return pairA.localeCompare(pairB)
        })

        if (!cancelled) setPools(foundPools)
      }
      catch (err) {
        console.error(err)
        if (!cancelled) setPools([])
      }
      finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchPools()

    return () => { cancelled = true }
  }, [account?.address, tokenList])

  return { pools, isLoading }
}
