import { useAtom, useSelector } from '@xstate/store/react'
import { useEffect, useState } from 'react'
import { selectedAccount } from './useConnect'
import { useEvmAddress } from './useEvmAddress'
import { dexStore, selectTokenList } from '../store/dexStore'
import type { Token } from '../store/dexStore'
import { contractWrite } from '../utils/contract-write'
import { CONTRACTS, PAIR_ABI, ROUTER_ABI } from '../utils/contracts'
import { computeUnderlyingAmounts, fetchPoolSnapshot, isHexAddress, isWqfAddress, ZERO_SS58 } from '../utils/liquidity'
import { callContract, decodeContractResult, encodeContractCall } from '../utils/revive'
import sdk from '../utils/sdk'
import { polkadotSigner } from '../utils/sdk-interface'
import { toast } from '../store/toastStore'

const SLIPPAGE_BPS = 50n

export type RemoveLiquidityStep =
  | 'idle'
  | 'approving'
  | 'removing'
  | 'success'
  | 'error'

export interface LiquidityPosition {
  pairAddress: `0x${string}` | null
  token0: Token | null
  token1: Token | null
  actualToken0: `0x${string}` | null
  actualToken1: `0x${string}` | null
  reserve0: bigint
  reserve1: bigint
  totalSupply: bigint
  userLiquidity: bigint
  isLoading: boolean
  error: string | null
}

const EMPTY_POSITION: LiquidityPosition = {
  pairAddress: null,
  token0: null,
  token1: null,
  actualToken0: null,
  actualToken1: null,
  reserve0: 0n,
  reserve1: 0n,
  totalSupply: 0n,
  userLiquidity: 0n,
  isLoading: false,
  error: null,
}

export function useRemoveLiquidity(pairAddress: string | null) {
  const account = useAtom(selectedAccount)
  const evmAddress = useEvmAddress(account?.address)
  const tokenList = useSelector(dexStore, selectTokenList)

  const [position, setPosition] = useState<LiquidityPosition>(EMPTY_POSITION)
  const [step, setStep] = useState<RemoveLiquidityStep>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshNonce, setRefreshNonce] = useState(0)

  useEffect(() => {
    if (!pairAddress || !isHexAddress(pairAddress)) {
      setPosition({
        ...EMPTY_POSITION,
        error: pairAddress ? 'Invalid pair address' : 'Missing pair address',
      })
      return
    }

    const resolvedPairAddress = pairAddress as `0x${string}`

    let cancelled = false

    async function fetchPosition() {
      setPosition(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const { api } = sdk('qf_network')
        const origin = account?.address ?? ZERO_SS58
        const snapshot = await fetchPoolSnapshot(api, resolvedPairAddress, tokenList, origin, evmAddress)

        if (cancelled) return

        setPosition({
          pairAddress: snapshot.pairAddress,
          token0: snapshot.token0,
          token1: snapshot.token1,
          actualToken0: snapshot.actualToken0,
          actualToken1: snapshot.actualToken1,
          reserve0: snapshot.reserve0,
          reserve1: snapshot.reserve1,
          totalSupply: snapshot.totalSupply,
          userLiquidity: snapshot.userLiquidity,
          isLoading: false,
          error: null,
        })
      }
      catch (err) {
        console.error('[useRemoveLiquidity] Failed to fetch position', err)
        if (!cancelled) {
          setPosition({
            ...EMPTY_POSITION,
            pairAddress: resolvedPairAddress,
            isLoading: false,
            error: err instanceof Error ? err.message : 'Could not load liquidity position',
          })
        }
      }
    }

    fetchPosition()
    return () => { cancelled = true }
  }, [account?.address, evmAddress, pairAddress, refreshNonce, tokenList])

  async function remove(liquidity: bigint) {
    if (!account?.address || !evmAddress) {
      setError('No wallet connected')
      setStep('error')
      return
    }

    if (!position.pairAddress || !position.token0 || !position.token1 || !position.actualToken0 || !position.actualToken1) {
      setError('No liquidity position loaded')
      setStep('error')
      return
    }

    if (liquidity <= 0n) {
      setError('Choose a liquidity amount greater than zero')
      setStep('error')
      return
    }

    if (liquidity > position.userLiquidity) {
      setError('Requested liquidity exceeds your LP balance')
      setStep('error')
      return
    }

    setError(null)
    setTxHash(null)
    setStep('idle')

    try {
      const signer = await polkadotSigner()
      if (!signer) throw new Error('No signer available')

      const { api } = sdk('qf_network')
      const allowanceRes = await callContract(api, {
        origin: account.address,
        dest: position.pairAddress,
        value: 0n,
        calldata: encodeContractCall(PAIR_ABI, 'allowance', [evmAddress, CONTRACTS.UniswapV2Router02]),
      })

      const allowance = allowanceRes.result.ok
        ? BigInt(String(decodeContractResult(PAIR_ABI, 'allowance', allowanceRes.result.ok.data)))
        : 0n

      if (allowance < liquidity) {
        setStep('approving')
        toast.info('Approving LP token', 'Confirm in your wallet')
        await contractWrite({
          address: position.pairAddress,
          abi: PAIR_ABI,
          functionName: 'approve',
          args: [CONTRACTS.UniswapV2Router02, liquidity],
          signer,
          ss58Address: account.address,
        })
        toast.success('LP token approved')
      }

      const { amount0, amount1 } = computeUnderlyingAmounts(
        liquidity,
        position.totalSupply,
        position.reserve0,
        position.reserve1,
      )

      const amount0Min = (amount0 * (10000n - SLIPPAGE_BPS)) / 10000n
      const amount1Min = (amount1 * (10000n - SLIPPAGE_BPS)) / 10000n
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60)

      setStep('removing')
      toast.info('Removing liquidity', 'Confirm in your wallet')

      const includesWqf0 = isWqfAddress(position.actualToken0)
      const includesWqf1 = isWqfAddress(position.actualToken1)

      const result = includesWqf0 || includesWqf1
        ? await contractWrite({
            address: CONTRACTS.UniswapV2Router02,
            abi: ROUTER_ABI,
            functionName: 'removeLiquidityETH',
            args: includesWqf0
              ? [position.actualToken1, liquidity, amount1Min, amount0Min, evmAddress, deadline]
              : [position.actualToken0, liquidity, amount0Min, amount1Min, evmAddress, deadline],
            signer,
            ss58Address: account.address,
          })
        : await contractWrite({
            address: CONTRACTS.UniswapV2Router02,
            abi: ROUTER_ABI,
            functionName: 'removeLiquidity',
            args: [
              position.actualToken0,
              position.actualToken1,
              liquidity,
              amount0Min,
              amount1Min,
              evmAddress,
              deadline,
            ],
            signer,
            ss58Address: account.address,
          })

      dexStore.send({ type: 'balances.invalidate' })
      setTxHash(result.txHash)
      setStep('success')
      setRefreshNonce(value => value + 1)
      toast.success('Liquidity removed', result.txHash)
    }
    catch (err) {
      console.error('[useRemoveLiquidity] error', err)
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      setStep('error')
      toast.error('Remove liquidity failed', message)
    }
  }

  return {
    position,
    step,
    txHash,
    error,
    evmAddress,
    remove,
    reset: () => {
      setStep('idle')
      setTxHash(null)
      setError(null)
    },
  }
}
