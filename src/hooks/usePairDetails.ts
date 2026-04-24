import { useAtom } from '@xstate/store/react'
import { useEffect, useState } from 'react'
import type { Token } from '../store/dexStore'
import { NATIVE_TOKEN_ADDRESS } from '../store/dexStore'
import { CONTRACTS, FACTORY_ABI, PAIR_ABI, TOKENS } from '../utils/contracts'
import { callContract, decodeContractResult, encodeContractCall } from '../utils/revive'
import sdk from '../utils/sdk'
import { selectedAccount } from './useConnect'

const ZERO_SS58 = '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM'

export interface PairDetails {
  pairAddress: string | null
  token0: string | null
  token1: string | null
  reserve0: bigint
  reserve1: bigint
  exists: boolean
  isLoading: boolean
}

const EMPTY_DETAILS: PairDetails = {
  pairAddress: null,
  token0: null,
  token1: null,
  reserve0: 0n,
  reserve1: 0n,
  exists: false,
  isLoading: false,
}

export function usePairDetails(tokenA: Token | undefined, tokenB: Token | undefined) {
  const account = useAtom(selectedAccount)
  const [details, setDetails] = useState<PairDetails>(EMPTY_DETAILS)

  useEffect(() => {
    if (!tokenA || !tokenB) {
      setDetails(EMPTY_DETAILS)
      return
    }

    const addrA = tokenA.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() ? TOKENS.WQF : tokenA.address
    const addrB = tokenB.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() ? TOKENS.WQF : tokenB.address

    if (addrA.toLowerCase() === addrB.toLowerCase()) {
      setDetails(EMPTY_DETAILS)
      return
    }

    let cancelled = false

    async function fetchDetails() {
      setDetails(prev => ({ ...prev, isLoading: true }))

      try {
        const { api } = sdk('qf_network')
        const origin = account?.address ?? ZERO_SS58

        const getPairCalldata = encodeContractCall(FACTORY_ABI, 'getPair', [addrA, addrB])
        const getPairRes = await callContract(api, {
          origin,
          dest: CONTRACTS.UniswapV2Factory,
          value: 0n,
          calldata: getPairCalldata,
        })

        if (!getPairRes?.result.ok) throw new Error('Failed to get pair')

        const pairAddress = decodeContractResult(FACTORY_ABI, 'getPair', getPairRes.result.ok.data) as string
        if (!pairAddress || /^0x0+$/.test(pairAddress)) {
          if (!cancelled) setDetails(EMPTY_DETAILS)
          return
        }

        const getReservesCalldata = encodeContractCall(PAIR_ABI, 'getReserves', [])
        const getToken0Calldata = encodeContractCall(PAIR_ABI, 'token0', [])
        const getToken1Calldata = encodeContractCall(PAIR_ABI, 'token1', [])

        const [reservesRes, token0Res, token1Res] = await Promise.all([
          callContract(api, { origin, dest: pairAddress as `0x${string}`, value: 0n, calldata: getReservesCalldata }),
          callContract(api, { origin, dest: pairAddress as `0x${string}`, value: 0n, calldata: getToken0Calldata }),
          callContract(api, { origin, dest: pairAddress as `0x${string}`, value: 0n, calldata: getToken1Calldata }),
        ])

        if (!reservesRes.result.ok || !token0Res.result.ok || !token1Res.result.ok) {
          throw new Error('Failed to fetch pair details')
        }

        const reserves = decodeContractResult(PAIR_ABI, 'getReserves', reservesRes.result.ok.data) as readonly [bigint, bigint, number]
        const token0 = decodeContractResult(PAIR_ABI, 'token0', token0Res.result.ok.data) as string
        const token1 = decodeContractResult(PAIR_ABI, 'token1', token1Res.result.ok.data) as string

        if (!cancelled) {
          setDetails({
            pairAddress,
            token0,
            token1,
            reserve0: reserves[0],
            reserve1: reserves[1],
            exists: true,
            isLoading: false,
          })
        }
      }
      catch (err) {
        console.error('[usePairDetails] Error:', err)
        if (!cancelled) setDetails(EMPTY_DETAILS)
      }
    }

    fetchDetails()
    return () => { cancelled = true }
  }, [account?.address, tokenA?.address, tokenB?.address])

  return details
}
