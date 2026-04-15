import { createAtom } from '@xstate/store'
import type { PolkadotClient, TypedApi } from 'polkadot-api'
import { createClient } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws-provider'
import { qf_network } from '../descriptors'

const config = {
  qf_network: {
    descriptor: qf_network,
    providers: ['wss://mainnet.qfnode.net'],
  },
} as const


export type Prefix = keyof typeof config
export const chainKeys = Object.keys(config) as Prefix[]

const clientStore = createAtom<Partial<Record<Prefix, PolkadotClient>>>({})

export default function sdk<T extends Prefix>(chain: T) {
  const clients = clientStore.get()

  if (!clients[chain]) {
    clients[chain] = createClient(
      getWsProvider(config[chain].providers[0]),
    )
  }

  return {
    api: clients[chain]!.getTypedApi(config[chain].descriptor) as TypedApi<typeof config[T]['descriptor']>,
    client: clients[chain]!,
  }
}
