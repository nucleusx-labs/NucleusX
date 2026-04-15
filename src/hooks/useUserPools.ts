import { getSs58AddressInfo } from '@polkadot-api/substrate-bindings'
import { useAtom, useSelector } from '@xstate/store/react'
import { useEffect, useState } from 'react'
import { selectedAccount } from '../hooks/useConnect'
import type { Token } from '../store/dexStore'
import { dexStore, NATIVE_TOKEN_ADDRESS, selectTokenList } from '../store/dexStore'
import { CONTRACTS, ERC20_ABI, FACTORY_ABI, TOKENS } from '../utils/contracts'
import { callContract, checkAccountMapping, decodeContractResult, encodeContractCall } from '../utils/revive'
import sdk from '../utils/sdk'

function pubkeyToH160(pubkey: Uint8Array): `0x${string}` {
  const h160 = pubkey.slice(12)
  return `0x${Array.from(h160).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`
}

export interface UserPool {
  tokenA: Token
  tokenB: Token
  pairAddress: string
  balance: bigint
  tvl: string
  volume24h: string
  fee: string
}

export function useUserPools() {
  const account = useAtom(selectedAccount)
  const tokenList = useSelector(dexStore, selectTokenList)
  
  const [pools, setPools] = useState<UserPool[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!account?.address) {
      setPools([])
      return
    }

    let cancelled = false
    setIsLoading(true)

    async function fetchPools() {
      try {
        const { api } = sdk('qf_network')
        
        let evmAddress: `0x${string}`
        const mapping = await checkAccountMapping(api, account!.address)
        if (mapping.isMapped && mapping.evmAddress) {
          evmAddress = mapping.evmAddress as `0x${string}`
        } else {
          const info = getSs58AddressInfo(account!.address)
          if (!info.isValid) throw new Error('Invalid SS58 address')
          evmAddress = pubkeyToH160(info.publicKey)
        }

        // Generate combinations
        const combinations: [Token, Token][] = []
        for (let i = 0; i < tokenList.length; i++) {
          for (let j = i + 1; j < tokenList.length; j++) {
            const tA = tokenList[i]
            const tB = tokenList[j]
            if (tA.address.toLowerCase() === tB.address.toLowerCase()) continue
            combinations.push([tA, tB])
          }
        }

        const foundPools: UserPool[] = []

        const fetchPromises = combinations.map(async ([tokenA, tokenB]) => {
            const tAAddress = tokenA.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() ? TOKENS.WQF : tokenA.address
            const tBAddress = tokenB.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase() ? TOKENS.WQF : tokenB.address

            if (tAAddress.toLowerCase() === tBAddress.toLowerCase()) return

            const calldata = encodeContractCall(FACTORY_ABI, 'getPair', [tAAddress, tBAddress])
            const res = await callContract(api, {
              origin: account!.address,
              dest: CONTRACTS.UniswapV2Factory,
              value: 0n,
              calldata
            }).catch(() => null)

            if (!res?.result.ok) return
            const pairAddressRaw = decodeContractResult(FACTORY_ABI, 'getPair', res.result.ok.data) as string
            const pairAddress = pairAddressRaw.toLowerCase()
            if (pairAddress === '0x0000000000000000000000000000000000000000') return

            const balanceCalldata = encodeContractCall(ERC20_ABI, 'balanceOf', [evmAddress])
            const balanceRes = await callContract(api, {
              origin: account!.address,
              dest: pairAddress,
              value: 0n,
              calldata: balanceCalldata
            }).catch(() => null)

            if (!balanceRes?.result.ok) return
            const lpBalance = BigInt(String(decodeContractResult(ERC20_ABI, 'balanceOf', balanceRes.result.ok.data)))

            if (lpBalance > 0n) {
              foundPools.push({
                tokenA,
                tokenB,
                pairAddress,
                balance: lpBalance,
                tvl: '-',
                volume24h: '-', 
                fee: '0.3%'
              })
            }
        })

        await Promise.allSettled(fetchPromises)
        if (!cancelled) {
          setPools(foundPools)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchPools()

    return () => { cancelled = true }
  }, [account?.address, tokenList])

  return { pools, isLoading }
}
