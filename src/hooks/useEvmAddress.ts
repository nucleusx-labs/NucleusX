import { getSs58AddressInfo } from '@polkadot-api/substrate-bindings'
import { useEffect, useState } from 'react'
import sdk from '../utils/sdk'
import { checkAccountMapping } from '../utils/revive'

function pubkeyToH160(pubkey: Uint8Array): `0x${string}` {
  const h160 = pubkey.slice(12)
  return `0x${Array.from(h160).map(b => b.toString(16).padStart(2, '0')).join('')}` as `0x${string}`
}

export function useEvmAddress(ss58Address: string | null | undefined): `0x${string}` | undefined {
  const [evmAddress, setEvmAddress] = useState<`0x${string}` | undefined>()

  useEffect(() => {
    if (!ss58Address) {
      setEvmAddress(undefined)
      return
    }

    const substrateAddress = ss58Address

    let cancelled = false

    async function resolveEvmAddress() {
      try {
        const { api } = sdk('qf_network')
        const mapping = await checkAccountMapping(api, substrateAddress)
        if (!cancelled && mapping.isMapped && mapping.evmAddress) {
          setEvmAddress(mapping.evmAddress as `0x${string}`)
          return
        }
      }
      catch {
        // Fall back to deterministic derivation below.
      }

      const info = getSs58AddressInfo(substrateAddress)
      if (!cancelled) {
        setEvmAddress(info.isValid ? pubkeyToH160(info.publicKey) : undefined)
      }
    }

    resolveEvmAddress()

    return () => { cancelled = true }
  }, [ss58Address])

  return evmAddress
}
