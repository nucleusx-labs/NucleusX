import { useAtom } from '@xstate/store/react'
import { useEffect, useState } from 'react'
import type { Token } from '../store/dexStore'
import { NATIVE_TOKEN_ADDRESS } from '../store/dexStore'
import { CONTRACTS, FACTORY_ABI, PAIR_ABI, TOKENS } from '../utils/contracts'
import { ethRpcClient } from '../utils/liquidity'
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

async function fetchPairDetailsViaEthRpc(addrA: `0x${string}`, addrB: `0x${string}`): Promise<PairDetails> {
  const pairAddress = await ethRpcClient.readContract({
    address: CONTRACTS.UniswapV2Factory,
    abi: FACTORY_ABI,
    functionName: 'getPair',
    args: [addrA, addrB],
  })

  if (!pairAddress || /^0x0+$/.test(pairAddress)) {
    return EMPTY_DETAILS
  }

  const [reserves, token0, token1] = await Promise.all([
    ethRpcClient.readContract({
      address: pairAddress,
      abi: PAIR_ABI,
      functionName: 'getReserves',
    }),
    ethRpcClient.readContract({
      address: pairAddress,
      abi: PAIR_ABI,
      functionName: 'token0',
    }),
    ethRpcClient.readContract({
      address: pairAddress,
      abi: PAIR_ABI,
      functionName: 'token1',
    }),
  ])

  return {
    pairAddress,
    token0,
    token1,
    reserve0: reserves[0],
    reserve1: reserves[1],
    exists: true,
    isLoading: false,
  }
}

export function usePairDetails(tokenA: Token | undefined, tokenB: Token | undefined) {
  const account = useAtom(selectedAccount)
  const [details, setDetails] = useState<PairDetails>(EMPTY_DETAILS)

  useEffect(() => {
    if (!tokenA || !tokenB) {
      setDetails(EMPTY_DETAILS)
      return
    }

    const addrA = (tokenA.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() ? TOKENS.WQF : tokenA.address) as `0x${string}`
    const addrB = (tokenB.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() ? TOKENS.WQF : tokenB.address) as `0x${string}`

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
          const fallbackDetails = await fetchPairDetailsViaEthRpc(addrA, addrB)
          if (!cancelled) setDetails(fallbackDetails)
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
        try {
          const fallbackDetails = await fetchPairDetailsViaEthRpc(addrA, addrB)
          if (!cancelled) setDetails(fallbackDetails)
        }
        catch (fallbackErr) {
          console.error('[usePairDetails] ETH-RPC fallback failed:', fallbackErr)
          if (!cancelled) setDetails(EMPTY_DETAILS)
        }
      }
    }

    fetchDetails()
    return () => { cancelled = true }
  }, [account?.address, tokenA?.address, tokenB?.address])

  return details
}
