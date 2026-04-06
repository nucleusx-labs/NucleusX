import { useAtom } from '@xstate/store/react'
import { getSs58AddressInfo } from '@polkadot-api/substrate-bindings'
import { useEffect, useState } from 'react'
import { selectedAccount } from './useConnect'
import { CONTRACTS, ERC20_ABI, ROUTER_ABI } from '../utils/contracts'
import { callContract, checkAccountMapping, decodeContractResult, encodeContractCall } from '../utils/revive'
import { polkadotSigner } from '../utils/sdk-interface'
import { contractWrite } from '../utils/contract-write'
import sdk from '../utils/sdk'
import type { Token } from '../store/dexStore'

function pubkeyToH160(pubkey: Uint8Array): `0x${string}` {
  const h160 = pubkey.slice(12)
  return `0x${Array.from(h160).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`
}

export type AddLiquidityStep =
  | 'idle'
  | 'approving-a'
  | 'approving-b'
  | 'adding'
  | 'success'
  | 'error'

export interface UseAddLiquidityReturn {
  step: AddLiquidityStep
  txHash: string | null
  error: string | null
  evmAddress: `0x${string}` | undefined
  supply: (tokenA: Token, tokenB: Token, amountA: bigint, amountB: bigint) => Promise<void>
  reset: () => void
}

/** 0.5% slippage tolerance */
const SLIPPAGE_BPS = 50n

export function useAddLiquidity(): UseAddLiquidityReturn {
  const account = useAtom(selectedAccount)
  const [step, setStep] = useState<AddLiquidityStep>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [evmAddress, setEvmAddress] = useState<`0x${string}` | undefined>()

  // Resolve EVM address on account change (mirrors useSwap pattern)
  useEffect(() => {
    if (!account?.address) {
      setEvmAddress(undefined)
      return
    }

    async function resolveEvm() {
      try {
        const { api } = sdk('qf_network')
        const mapping = await checkAccountMapping(api, account!.address)
        if (mapping.isMapped && mapping.evmAddress) {
          setEvmAddress(mapping.evmAddress as `0x${string}`)
          return
        }
      }
      catch { /* fall through to pubkey derivation */ }

      const info = getSs58AddressInfo(account!.address)
      if (info.isValid) setEvmAddress(pubkeyToH160(info.publicKey))
    }

    resolveEvm()
  }, [account?.address])

  async function supply(tokenA: Token, tokenB: Token, amountA: bigint, amountB: bigint) {
    if (!account?.address || !evmAddress) {
      setError('No wallet connected')
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

      // Helper: read current ERC20 allowance
      async function getAllowance(tokenAddress: `0x${string}`): Promise<bigint> {
        const calldata = encodeContractCall(ERC20_ABI, 'allowance', [evmAddress, CONTRACTS.UniswapV2Router02])
        const res = await callContract(api, { origin: account!.address, dest: tokenAddress, value: 0n, calldata })
        return res.result.ok
          ? BigInt(String(decodeContractResult(ERC20_ABI, 'allowance', res.result.ok.data)))
          : 0n
      }

      // Step 1: Approve Token A if needed
      if ((await getAllowance(tokenA.address)) < amountA) {
        setStep('approving-a')
        await contractWrite({
          address: tokenA.address,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACTS.UniswapV2Router02, amountA],
          signer,
          ss58Address: account.address,
        })
      }

      // Step 2: Approve Token B if needed
      if ((await getAllowance(tokenB.address)) < amountB) {
        setStep('approving-b')
        await contractWrite({
          address: tokenB.address,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACTS.UniswapV2Router02, amountB],
          signer,
          ss58Address: account.address,
        })
      }

      // Step 3: Add liquidity
      setStep('adding')
      const amountAMin = (amountA * (10000n - SLIPPAGE_BPS)) / 10000n
      const amountBMin = (amountB * (10000n - SLIPPAGE_BPS)) / 10000n
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60)

      const result = await contractWrite({
        address: CONTRACTS.UniswapV2Router02,
        abi: ROUTER_ABI,
        functionName: 'addLiquidity',
        args: [tokenA.address, tokenB.address, amountA, amountB, amountAMin, amountBMin, evmAddress, deadline],
        signer,
        ss58Address: account.address,
      })

      setTxHash(result.txHash)
      setStep('success')
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed')
      setStep('error')
    }
  }

  return {
    step,
    txHash,
    error,
    evmAddress,
    supply,
    reset: () => { setStep('idle'); setError(null); setTxHash(null) },
  }
}
