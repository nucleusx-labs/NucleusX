import type { PolkadotSigner } from 'polkadot-api'
import sdk from './sdk'
import { signAndSubmitWithRetry } from './sign-retry'

const MAPPED_KEY_PREFIX = 'nucleusx:mapped:'

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

function collectErrorText(input: unknown): string {
  if (input == null) return ''
  if (typeof input === 'string') return input
  if (typeof input === 'number' || typeof input === 'boolean' || typeof input === 'bigint') return String(input)
  if (Array.isArray(input)) return input.map(item => collectErrorText(item)).join(' ')
  if (typeof input === 'object') {
    return Object.values(input as Record<string, unknown>).map(v => collectErrorText(v)).join(' ')
  }
  return ''
}

function isAlreadyMappedError(input: unknown): boolean {
  const text = collectErrorText(input).toLowerCase()
  return text.includes('accountalreadymapped') || text.includes('alreadymapped')
}

function isAlreadyMappedDispatchError(dispatchError: unknown): boolean {
  if (!dispatchError || typeof dispatchError !== 'object') return false
  const maybeDispatch = dispatchError as { type?: unknown; value?: unknown }
  if (maybeDispatch.type !== 'Revive') return false
  if (!maybeDispatch.value || typeof maybeDispatch.value !== 'object') return false
  const reviveError = maybeDispatch.value as { type?: unknown }
  return reviveError.type === 'AccountAlreadyMapped'
}

async function isMappedOnChain(ss58Address: string): Promise<boolean> {
  // ReviveApi.address always returns the h160 *derived* from the SS58 pubkey —
  // it does not prove the account was registered via map_account. To confirm
  // a real mapping we must read Revive.OriginalAccount and check it points
  // back at our SS58.
  try {
    const { api } = sdk('qf_network')
    const h160 = await (api.apis.ReviveApi.address as any)(ss58Address)
    if (!h160) return false
    const original = await (api.query.Revive as any).OriginalAccount.getValue(h160)
    return original === ss58Address
  }
  catch {
    return false
  }
}

/**
 * Ensure the given SS58 account has an on-chain H160 mapping registered via
 * the revive.map_account extrinsic.  If the mapping already exists this is a
 * no-op.  The mapping is required so that EVM contracts can resolve the
 * substrate account's canonical H160 address.
 */
export async function ensureMapped(signer: PolkadotSigner, ss58Address: string): Promise<void> {
  const { api } = sdk('qf_network')

  const cacheKey = `${MAPPED_KEY_PREFIX}${ss58Address}`
  const storage = getStorage()

  // Fast path: trust the cached flag so repeat transactions don't re-read
  // storage for every write.
  if (storage?.getItem(cacheKey) === 'true') {
    return
  }

  if (await isMappedOnChain(ss58Address)) {
    storage?.setItem(cacheKey, 'true')
    return
  }

  console.log('[Revive] mapping account', { ss58Address })
  try {
    const result = await signAndSubmitWithRetry<any>(() =>
      (api.tx.Revive as any).map_account({}).signAndSubmit(signer),
    )
    if (result.ok || isAlreadyMappedDispatchError(result.dispatchError)) {
      storage?.setItem(cacheKey, 'true')
      console.log('[Revive] account mapped ok')
      return
    }
    throw new Error(`Revive.map_account failed: ${String(result.dispatchError ?? 'unknown')}`)
  }
  catch (err) {
    if (isAlreadyMappedError(err)) {
      storage?.setItem(cacheKey, 'true')
      return
    }
    throw err
  }
}
