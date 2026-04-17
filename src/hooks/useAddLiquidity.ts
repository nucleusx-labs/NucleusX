import { getSs58AddressInfo } from '@polkadot-api/substrate-bindings'
import { useAtom } from '@xstate/store/react'
import { useEffect, useState } from 'react'
import type { Token } from '../store/dexStore'
import { NATIVE_TOKEN_ADDRESS } from '../store/dexStore'
import { contractWrite } from '../utils/contract-write'
import { CONTRACTS, ERC20_ABI, FACTORY_ABI, ROUTER_ABI } from '../utils/contracts'
import { callContract, checkAccountMapping, decodeContractResult, encodeContractCall } from '../utils/revive'
import sdk from '../utils/sdk'
import { polkadotSigner } from '../utils/sdk-interface'
import { toast } from '../store/toastStore'
import { selectedAccount } from './useConnect'

function pubkeyToH160(pubkey: Uint8Array): `0x${string}` {
  const h160 = pubkey.slice(12)
  return `0x${Array.from(h160).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`
}

export type AddLiquidityStep =
  | 'idle'
  | 'approving-a'
  | 'approving-b'
  | 'creating-pair'
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

    if (tokenA.address.toLowerCase() === tokenB.address.toLowerCase()) {
      setError('Cannot add liquidity for identical tokens')
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
        const calldata = encodeContractCall(ERC20_ABI, 'allowance', [evmAddress!, CONTRACTS.UniswapV2Router02])
        const res = await callContract(api, { origin: account!.address, dest: tokenAddress, value: 0n, calldata })
        return res.result.ok
          ? BigInt(String(decodeContractResult(ERC20_ABI, 'allowance', res.result.ok.data)))
          : 0n
      }

      const isNativeA = tokenA.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
      const isNativeB = tokenB.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()

      // Step 1: Approve Token A if needed (skip for native token — cannot approve ETH)
      if (!isNativeA && (await getAllowance(tokenA.address)) < amountA) {
        setStep('approving-a')
        toast.info(`Approving ${tokenA.symbol}`, 'Confirm in your wallet')
        const approveA = await contractWrite({
          address: tokenA.address,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACTS.UniswapV2Router02, amountA],
          signer,
          ss58Address: account.address,
        })
        toast.success(`${tokenA.symbol} approved`, approveA.txHash)
      }

      // Step 2: Approve Token B if needed (skip for native token)
      if (!isNativeB && (await getAllowance(tokenB.address)) < amountB) {
        setStep('approving-b')
        toast.info(`Approving ${tokenB.symbol}`, 'Confirm in your wallet')
        const approveB = await contractWrite({
          address: tokenB.address,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACTS.UniswapV2Router02, amountB],
          signer,
          ss58Address: account.address,
        })
        toast.success(`${tokenB.symbol} approved`, approveB.txHash)
      }

      // Step 3: Add liquidity
      setStep('adding')
      toast.info('Adding liquidity', 'Confirm in your wallet')
      const amountAMin = (amountA * (10000n - SLIPPAGE_BPS)) / 10000n
      const amountBMin = (amountB * (10000n - SLIPPAGE_BPS)) / 10000n
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 20 * 60)

      let result: { txHash: string; ok: boolean; events: unknown[] }

      if (isNativeA || isNativeB) {
        // One side is native QF — use addLiquidityETH
        // addLiquidityETH(token, amountTokenDesired, amountTokenMin, amountETHMin, to, deadline)
        const erc20Token = isNativeA ? tokenB : tokenA
        const amountToken = isNativeA ? amountB : amountA
        const amountTokenMin = isNativeA ? amountBMin : amountAMin
        const amountETHMin = isNativeA ? amountAMin : amountBMin
        const nativeAmount = isNativeA ? amountA : amountB

        // Pre-flight: read router.WETH() to detect identical-address revert before it happens
        const wethCalldata = encodeContractCall(ROUTER_ABI, 'WETH', [])
        const wethRes = await callContract(api, { origin: account.address, dest: CONTRACTS.UniswapV2Router02, value: 0n, calldata: wethCalldata })
        const routerWeth = wethRes.result.ok
          ? (decodeContractResult(ROUTER_ABI, 'WETH', wethRes.result.ok.data) as string)
          : null
        console.log('[useAddLiquidity] router.WETH():', routerWeth, '| erc20Token:', erc20Token.address)

        if (routerWeth && routerWeth.toLowerCase() === erc20Token.address.toLowerCase()) {
          throw new Error(
            `Cannot add QF + WQF liquidity: the router's internal WETH address is WQF (${routerWeth}). `
            + 'Pairing WQF with itself would fail. Try adding liquidity for a different token pair, '
            + 'or add liquidity directly using WQF + another ERC20 token.',
          )
        }

        // Pre-flight: check whether the pair already exists via the factory
        const getPairCalldata = encodeContractCall(FACTORY_ABI, 'getPair', [
          erc20Token.address,
          (routerWeth ?? erc20Token.address) as `0x${string}`,
        ])
        const pairRes = await callContract(api, { origin: account.address, dest: CONTRACTS.UniswapV2Factory, value: 0n, calldata: getPairCalldata })
        const pairAddress = pairRes.result.ok
          ? (decodeContractResult(FACTORY_ABI, 'getPair', pairRes.result.ok.data) as string)
          : null
        console.log('[useAddLiquidity] factory.getPair result:', pairAddress)

        console.log('[useAddLiquidity] using addLiquidityETH, nativeAmount:', nativeAmount.toString())
        result = await contractWrite({
          address: CONTRACTS.UniswapV2Router02,
          abi: ROUTER_ABI,
          functionName: 'addLiquidityETH',
          args: [erc20Token.address, amountToken, amountTokenMin, amountETHMin, evmAddress, deadline],
          value: nativeAmount,
          signer,
          ss58Address: account.address,
        })
      }
      else {
        // Pre-flight: if the pair doesn't exist yet, deploy it in its own tx.
        // Wrapping CREATE2 and the actual liquidity provision in one Revive.call
        // blows past pallet-revive's per-call gas/storage budget on QF and traps
        // with Module.Revive.ContractTrapped — splitting them fixes that.
        const getPairCalldata = encodeContractCall(FACTORY_ABI, 'getPair', [tokenA.address, tokenB.address])
        const pairRes = await callContract(api, {
          origin: account.address,
          dest: CONTRACTS.UniswapV2Factory,
          value: 0n,
          calldata: getPairCalldata,
        })
        const pairAddress = pairRes.result.ok
          ? (decodeContractResult(FACTORY_ABI, 'getPair', pairRes.result.ok.data) as string)
          : null
        console.log('[useAddLiquidity] factory.getPair result:', pairAddress)

        if (!pairAddress || /^0x0+$/.test(pairAddress)) {
          setStep('creating-pair')
          toast.info('Creating pair', 'Confirm in your wallet')
          await contractWrite({
            address: CONTRACTS.UniswapV2Factory,
            abi: FACTORY_ABI,
            functionName: 'createPair',
            args: [tokenA.address, tokenB.address],
            signer,
            ss58Address: account.address,
          })
          toast.success('Pair created')
          setStep('adding')
        }

        result = await contractWrite({
          address: CONTRACTS.UniswapV2Router02,
          abi: ROUTER_ABI,
          functionName: 'addLiquidity',
          args: [tokenA.address, tokenB.address, amountA, amountB, amountAMin, amountBMin, evmAddress, deadline],
          signer,
          ss58Address: account.address,
        })
      }

      setTxHash(result.txHash)
      setStep('success')
      toast.success('Liquidity added', result.txHash)
    }
    catch (err) {
      console.error('[useAddLiquidity] error', err)
      const msg = err instanceof Error
        ? err.message
        : typeof err === 'string'
          ? err
          : JSON.stringify(err)
      setError(msg)
      setStep('error')
      toast.error('Add liquidity failed', msg)
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
