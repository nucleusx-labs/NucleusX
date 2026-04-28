import type { TypedApi } from 'polkadot-api'
import { createPublicClient, http, type Address } from 'viem'
import { NATIVE_TOKEN, type Token } from '../store/dexStore'
import { ERC20_ABI, PAIR_ABI, TOKENS } from './contracts'
import { callContract, decodeContractResult, encodeContractCall } from './revive'

export const ZERO_SS58 = '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM'
const ETH_RPC_URL = 'https://archive.mainnet.qfnode.net/eth'

const ethRpcClient = createPublicClient({
  transport: http(ETH_RPC_URL),
})

export interface PoolSnapshot {
  pairAddress: `0x${string}`
  actualToken0: `0x${string}`
  actualToken1: `0x${string}`
  token0: Token
  token1: Token
  reserve0: bigint
  reserve1: bigint
  totalSupply: bigint
  userLiquidity: bigint
}

export function isHexAddress(value: string): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

export function isZeroAddress(address: string): boolean {
  return /^0x0+$/.test(address.toLowerCase())
}

export function isWqfAddress(address: string): boolean {
  return address.toLowerCase() === TOKENS.WQF.toLowerCase()
}

export function toDisplayTokenAddress(address: `0x${string}`): `0x${string}` {
  return isWqfAddress(address) ? NATIVE_TOKEN.address : address
}

export function formatTokenAmount(amount: bigint, decimals: number, fractionDigits = 4): string {
  if (amount <= 0n) return '0'

  const divisor = 10n ** BigInt(decimals)
  const whole = amount / divisor
  const fraction = (amount % divisor)
    .toString()
    .padStart(decimals, '0')
    .slice(0, fractionDigits)
    .replace(/0+$/, '')

  return fraction ? `${whole}.${fraction}` : whole.toString()
}

export function computeUnderlyingAmounts(
  liquidity: bigint,
  totalSupply: bigint,
  reserve0: bigint,
  reserve1: bigint,
): { amount0: bigint, amount1: bigint } {
  if (liquidity <= 0n || totalSupply <= 0n) {
    return { amount0: 0n, amount1: 0n }
  }

  return {
    amount0: (liquidity * reserve0) / totalSupply,
    amount1: (liquidity * reserve1) / totalSupply,
  }
}

async function readErc20MetadataViaRevive(
  api: TypedApi<any>,
  address: `0x${string}`,
  origin: string,
) {
  const [nameRes, symbolRes, decimalsRes] = await Promise.all([
    callContract(api, { origin, dest: address, value: 0n, calldata: encodeContractCall(ERC20_ABI, 'name', []) }).catch(() => null),
    callContract(api, { origin, dest: address, value: 0n, calldata: encodeContractCall(ERC20_ABI, 'symbol', []) }).catch(() => null),
    callContract(api, { origin, dest: address, value: 0n, calldata: encodeContractCall(ERC20_ABI, 'decimals', []) }).catch(() => null),
  ])

  return {
    name: nameRes?.result.ok
      ? String(decodeContractResult(ERC20_ABI, 'name', nameRes.result.ok.data))
      : null,
    symbol: symbolRes?.result.ok
      ? String(decodeContractResult(ERC20_ABI, 'symbol', symbolRes.result.ok.data))
      : null,
    decimals: decimalsRes?.result.ok
      ? Number(decodeContractResult(ERC20_ABI, 'decimals', decimalsRes.result.ok.data))
      : null,
  }
}

async function readErc20MetadataViaEthRpc(address: `0x${string}`) {
  async function readField(functionName: 'name' | 'symbol' | 'decimals') {
    const data = encodeContractCall(ERC20_ABI, functionName, [])
    const response = await ethRpcClient.call({ to: address, data })
    if (!response.data) return null
    return decodeContractResult(ERC20_ABI, functionName, response.data)
  }

  const [name, symbol, decimals] = await Promise.all([
    readField('name').catch(() => null),
    readField('symbol').catch(() => null),
    readField('decimals').catch(() => null),
  ])

  return {
    name: typeof name === 'string' ? name : null,
    symbol: typeof symbol === 'string' ? symbol : null,
    decimals: typeof decimals === 'number' ? decimals : null,
  }
}

export async function fetchTokenMetadata(
  api: TypedApi<any>,
  address: `0x${string}`,
  knownTokens: Token[],
  origin = ZERO_SS58,
): Promise<Token> {
  const displayAddress = toDisplayTokenAddress(address)
  const existing = knownTokens.find(token => token.address.toLowerCase() === displayAddress.toLowerCase())
  if (existing) return existing

  if (displayAddress.toLowerCase() === NATIVE_TOKEN.address.toLowerCase()) {
    return NATIVE_TOKEN
  }

  const reviveMetadata = await readErc20MetadataViaRevive(api, address, origin)
  const ethRpcMetadata = (
    reviveMetadata.name && reviveMetadata.symbol && reviveMetadata.decimals !== null
  )
    ? null
    : await readErc20MetadataViaEthRpc(address).catch(() => null)

  const name = reviveMetadata.name ?? ethRpcMetadata?.name ?? null
  const symbol = reviveMetadata.symbol ?? ethRpcMetadata?.symbol ?? null
  const decimals = reviveMetadata.decimals ?? ethRpcMetadata?.decimals ?? null

  if (!name || !symbol || decimals === null) {
    throw new Error(`Could not read token metadata for ${address}`)
  }

  return {
    address: displayAddress,
    symbol,
    name,
    decimals,
    isCustom: true,
  }
}

export async function fetchPoolSnapshot(
  api: TypedApi<any>,
  pairAddress: `0x${string}`,
  knownTokens: Token[],
  origin = ZERO_SS58,
  evmAddress?: `0x${string}`,
): Promise<PoolSnapshot> {
  const [token0Res, token1Res, reservesRes, totalSupplyRes, userLiquidityRes] = await Promise.all([
    callContract(api, { origin, dest: pairAddress, value: 0n, calldata: encodeContractCall(PAIR_ABI, 'token0', []) }),
    callContract(api, { origin, dest: pairAddress, value: 0n, calldata: encodeContractCall(PAIR_ABI, 'token1', []) }),
    callContract(api, { origin, dest: pairAddress, value: 0n, calldata: encodeContractCall(PAIR_ABI, 'getReserves', []) }),
    callContract(api, { origin, dest: pairAddress, value: 0n, calldata: encodeContractCall(PAIR_ABI, 'totalSupply', []) }),
    evmAddress
      ? callContract(api, { origin, dest: pairAddress, value: 0n, calldata: encodeContractCall(PAIR_ABI, 'balanceOf', [evmAddress]) })
      : Promise.resolve(null),
  ])

  if (!token0Res.result.ok || !token1Res.result.ok || !reservesRes.result.ok || !totalSupplyRes.result.ok) {
    throw new Error(`Could not read pair snapshot for ${pairAddress}`)
  }

  const actualToken0 = decodeContractResult(PAIR_ABI, 'token0', token0Res.result.ok.data) as Address
  const actualToken1 = decodeContractResult(PAIR_ABI, 'token1', token1Res.result.ok.data) as Address
  const [token0, token1] = await Promise.all([
    fetchTokenMetadata(api, actualToken0, knownTokens, origin),
    fetchTokenMetadata(api, actualToken1, knownTokens, origin),
  ])

  const reserves = decodeContractResult(PAIR_ABI, 'getReserves', reservesRes.result.ok.data) as readonly [bigint, bigint, number]
  const totalSupply = BigInt(String(decodeContractResult(PAIR_ABI, 'totalSupply', totalSupplyRes.result.ok.data)))
  const userLiquidity = userLiquidityRes?.result.ok
    ? BigInt(String(decodeContractResult(PAIR_ABI, 'balanceOf', userLiquidityRes.result.ok.data)))
    : 0n

  return {
    pairAddress,
    actualToken0,
    actualToken1,
    token0,
    token1,
    reserve0: reserves[0],
    reserve1: reserves[1],
    totalSupply,
    userLiquidity,
  }
}
