import { formatValue } from '@polkadot-api/react-components'
import type { PolkadotSigner } from 'polkadot-api'
import { connectedWallet, selectedAccount } from '../hooks/useConnect'
import { DAPP_NAME } from './dapp-name'
import type {
  EstimatedCallResources,
  ReviveCallOptions,
  ReviveTransactionOptions,
  TransactionCallbacks,
} from '../utils/revive'
import { callContract, checkAccountMapping, estimateGas, submitContractTransaction } from '../utils/revive'
import type { Prefix } from '../utils/sdk'
import sdk from '../utils/sdk'
import { connectInjectedExtension, type InjectedPolkadotAccount } from './injected-extensions'
import { getQfPolkadotApi, submitTxAndWait } from './polkadot-submit'

export async function polkadotAccount(address = selectedAccount.get()?.address): Promise<InjectedPolkadotAccount | undefined> {
  const walletName = connectedWallet.get()?.extensionName
  if (!walletName) {
    console.warn('No connected wallet found')
    return undefined
  }

  // Use the custom PAPI signer that fully owns payload construction and forces
  // `withSignedTransaction: false` / `mode: 0` before sending the payload to
  // the wallet — wallets (notably Talisman) otherwise build their own payload
  // against stale cached metadata and return bytes that fail verification on
  // QF network (BadProof).
  const extension = await connectInjectedExtension(walletName, DAPP_NAME)
  const account = extension
    .getAccounts()
    .find(acc => acc.address === address)

  return account
}

export async function polkadotSigner(): Promise<PolkadotSigner | undefined> {
  const account = await polkadotAccount()
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
  const account = await polkadotAccount()
  if (!account?.polkadotSigner) {
    throw new Error('No signer available')
  }

  const { api } = sdk(chainPrefix)
  return await submitContractTransaction(
    api,
    {
      ...options,
      signer: account.polkadotSigner,
      pjsSigner: account.pjsSigner,
      signerAddress: account.address,
    },
    callbacks,
  )
}

/**
 * Estimate gas for a Revive API call
 */
export async function reviveEstimateGas(
  chainPrefix: Prefix,
  options: Omit<ReviveCallOptions, 'origin'>,
): Promise<EstimatedCallResources> {
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
  const freeBalance = formatValue(balance.data.free, tokenDecimals, false)

  return {
    balance: freeBalance,
    symbol: tokenSymbol,
    chainName: chainSpec.name,
  }
}

export async function createRemarkTransaction(
  chainPrefix: Prefix,
  message: string,
  address = '',
  _signer: PolkadotSigner,
  callbacks: {
    onTxHash: (hash: string) => void
    onFinalized: () => void
    onError: (error: string) => void
  },
) {
  try {
    const account = await polkadotAccount(address)
    if (!account?.pjsSigner) {
      callbacks.onError('QF transaction signing requires the injected wallet signer. Reconnect your QF wallet and retry.')
      return
    }

    const api = await getQfPolkadotApi()
    let notifiedHash = ''
    const result = await submitTxAndWait({
      api,
      signerAddress: account.address,
      signer: account.pjsSigner,
      tx: api.tx.system.remark(message),
      label: `${chainPrefix} remark`,
      timeoutMs: 120_000,
      onTxHash: (hash) => {
        notifiedHash = hash
        callbacks.onTxHash(hash)
      },
    })

    if (!result.ok) {
      callbacks.onError('Transaction failed on-chain')
      return
    }

    if (!notifiedHash && result.txHash) {
      callbacks.onTxHash(result.txHash)
    }
    callbacks.onFinalized()
  }
  catch (err: any) {
    console.error(err, address)
    callbacks.onError(err?.message || 'Unknown error')
  }
}
