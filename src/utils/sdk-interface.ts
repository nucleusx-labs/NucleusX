import type { PolkadotSigner } from 'polkadot-api'
import type { Prefix } from '../utils/sdk'
import type { ReviveCallOptions, ReviveTransactionOptions, TransactionCallbacks } from '../utils/revive'
import { formatValue } from '@polkadot-api/react-components'
import { Binary } from 'polkadot-api'
import { connectInjectedExtension } from 'polkadot-api/pjs-signer'
import { name } from '../../package.json'
import { connectedWallet, selectedAccount } from '../hooks/useConnect'
import sdk from '../utils/sdk'
import { callContract, submitContractTransaction, estimateGas, checkAccountMapping } from '../utils/revive'

export const DAPP_NAME = name

export async function polkadotSigner(): Promise<PolkadotSigner | undefined> {
  const walletName = connectedWallet.get()?.extensionName
  if (!walletName) {
    console.warn('No connected wallet found')
    return undefined
  }

  const selectedExtension = await connectInjectedExtension(walletName)
  const account = selectedExtension
    .getAccounts()
    .find(acc => acc.address === selectedAccount.get()?.address)

  return account?.polkadotSigner
}

/**
 * Get the currently selected SS58 address
 */
export function getSelectedAddress(): string | undefined {
  return selectedAccount.get()?.address
}

/**
 * Perform a Revive API contract call (read-only)
 */
export async function reviveCall(
  chainPrefix: Prefix,
  options: Omit<ReviveCallOptions, 'origin'>,
): Promise<any> {
  const address = getSelectedAddress()
  if (!address) {
    throw new Error('No account selected')
  }

  const { api } = sdk(chainPrefix)
  return await callContract(api, { ...options, origin: address })
}

/**
 * Submit a Revive API contract transaction (state-changing)
 */
export async function reviveTransaction(
  chainPrefix: Prefix,
  options: Omit<ReviveTransactionOptions, 'signer'>,
  callbacks: TransactionCallbacks,
): Promise<() => void> {
  const signer = await polkadotSigner()
  if (!signer) {
    throw new Error('No signer available')
  }

  const { api } = sdk(chainPrefix)
  return await submitContractTransaction(api, { ...options, signer }, callbacks)
}

/**
 * Estimate gas for a Revive API call
 */
export async function reviveEstimateGas(
  chainPrefix: Prefix,
  options: Omit<ReviveCallOptions, 'origin'>,
): Promise<{ gasConsumed: bigint, gasRequired: bigint }> {
  const address = getSelectedAddress()
  if (!address) {
    throw new Error('No account selected')
  }

  const { api } = sdk(chainPrefix)
  return await estimateGas(api, { ...options, origin: address })
}

/**
 * Check if account is mapped (SS58 -> EVM)
 */
export async function reviveCheckMapping(
  chainPrefix: Prefix,
  address?: string,
): Promise<{ isMapped: boolean, evmAddress?: string }> {
  const addr = address || getSelectedAddress()
  if (!addr) {
    throw new Error('No account selected')
  }

  const { api } = sdk(chainPrefix)
  return await checkAccountMapping(api, addr)
}

export async function subscribeToBlocks(
  networkKey: Prefix,
  onBlock: (data: { blockHeight: number, chainName: string }) => void,
) {
  const { client } = sdk(networkKey)
  const chainName = await client.getChainSpecData().then(data => data.name)

  return client.blocks$.subscribe(async (block) => {
    onBlock({ blockHeight: block.number, chainName })
  })
}

export async function getBalance(chainPrefix: Prefix, address: string) {
  const { api, client } = sdk(chainPrefix)

  const [balance, chainSpec] = await Promise.all([
    api.query.System.Account.getValue(address),
    client.getChainSpecData(),
  ])
  const tokenDecimals = chainSpec.properties.tokenDecimals
  const tokenSymbol = chainSpec.properties.tokenSymbol
  const freeBalance = formatValue(balance.data.free, tokenDecimals)

  return {
    balance: freeBalance,
    symbol: tokenSymbol,
    chainName: chainSpec.name,
  }
}

export function createRemarkTransaction(
  chainPrefix: Prefix,
  message: string,
  address = '',
  signer: PolkadotSigner,
  callbacks: {
    onTxHash: (hash: string) => void
    onFinalized: () => void
    onError: (error: string) => void
  },
) {
  const { api } = sdk(chainPrefix)

  const remark = Binary.fromText(message)
  const tx = api.tx.System.remark({ remark })

  const unsub = tx.signSubmitAndWatch(signer).subscribe({
    next: (event) => {
      if (event.type === 'txBestBlocksState' && event.found) {
        callbacks.onTxHash(event.txHash)
      }

      if (event.type === 'finalized') {
        callbacks.onFinalized()
        unsub.unsubscribe()
      }
    },
    error: (err) => {
      unsub.unsubscribe()
      console.error(err, address)
      callbacks.onError(err.message || 'Unknown error')
    },
  })
}
