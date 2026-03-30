import type { Prefix } from '../utils/sdk'
import { AccountId } from 'polkadot-api'

const subscan: Record<Prefix, string> = {
  qf_network: 'https://portal.qfnetwork.xyz/?rpc=wss%3A%2F%2Fmainnet.qfnode.net#/explorer',
}

export function unifyAddress(address: string) {
  const addressCodec = AccountId(0)
  const publicKey = addressCodec.enc(address)
  return addressCodec.dec(publicKey)
}

export function stripAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export function explorerAccount(chain: Prefix, address?: string): string {
  const url = new URL(subscan[chain])
  url.pathname = `/account/${address || ''}`

  return url.toString()
}

export function explorerDetail(chain: Prefix, hash: string): string {
  const url = new URL(subscan[chain])
  url.pathname = `/extrinsic/${hash}`

  return url.toString()
}

export function buyTokenUrl(_chainKey: Prefix, _address?: string) {
  return new URL('https://faucet.polkadot.io/').toString()
}
