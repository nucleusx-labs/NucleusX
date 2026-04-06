import type { PolkadotSigner } from 'polkadot-api'
import sdk from './sdk'

/**
 * Ensure the given SS58 account has an on-chain H160 mapping registered via
 * the revive.map_account extrinsic.  If the mapping already exists this is a
 * no-op.  The mapping is required so that EVM contracts can resolve the
 * substrate account's canonical H160 address.
 */
export async function ensureMapped(signer: PolkadotSigner, ss58Address: string): Promise<void> {
  const { api } = sdk('qf_network')

  try {
    const h160 = await (api.apis.ReviveApi.address as any)(ss58Address)
    if (h160) return
  }
  catch {
    // Address not mapped yet — fall through and register
  }

  await (api.tx.Revive as any).map_account({}).signAndSubmit(signer)
}
