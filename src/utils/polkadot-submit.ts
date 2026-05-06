import { ApiPromise, WsProvider } from '@polkadot/api'
import type { Signer } from '@polkadot/api/types'

const QF_WS_RPC_URL = 'wss://mainnet.qfnode.net'

let apiPromise: Promise<ApiPromise> | null = null

type TxStatus = {
  isBroadcast?: boolean
  isInBlock?: boolean
  isFinalized?: boolean
  asInBlock?: { toHex?: () => string; toString?: () => string }
  asFinalized?: { toHex?: () => string; toString?: () => string }
}

type TxEvent = {
  event?: {
    section?: string
    method?: string
    data?: unknown[]
  }
}

type TxResult = {
  status?: TxStatus
  txHash?: { toHex?: () => string; toString?: () => string }
  dispatchError?: unknown
  events?: TxEvent[]
}

type TxLike = {
  signAndSend: (
    signerAddress: string,
    options: { signer: Signer; withSignedTransaction: false },
    cb: (result: TxResult) => void,
  ) => Promise<() => void>
}

function toHexish(value: unknown): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (typeof value === 'object') {
    const maybeHex = (value as { toHex?: () => string }).toHex?.()
    if (maybeHex) return maybeHex
    return (value as { toString?: () => string }).toString?.()
  }
  return String(value)
}

export async function getQfPolkadotApi(): Promise<ApiPromise> {
  apiPromise ??= ApiPromise.create({
    provider: new WsProvider(QF_WS_RPC_URL),
    noInitWarn: true,
  })
  return apiPromise
}

function formatDispatchError(api: ApiPromise, dispatchError: unknown): string {
  const error = dispatchError as {
    isModule?: boolean
    asModule?: unknown
    toString?: () => string
  }

  if (error?.isModule && error.asModule) {
    try {
      const meta = api.registry.findMetaError(error.asModule as never)
      return `${meta.section}.${meta.name}${meta.docs.length ? `: ${meta.docs.join(' ')}` : ''}`
    }
    catch {
      return error.toString?.() ?? 'module dispatch error'
    }
  }

  return error?.toString?.() ?? String(dispatchError ?? 'unknown dispatch error')
}

export async function submitTxAndWait({
  api,
  signerAddress,
  signer,
  tx,
  label,
  timeoutMs = 180_000,
  onTxHash,
}: {
  api: ApiPromise
  signerAddress: string
  signer: unknown
  tx: TxLike
  label: string
  timeoutMs?: number
  onTxHash?: (hash: string) => void
}): Promise<{ txHash: string; blockHash?: string; ok: boolean; events: TxEvent[] }> {
  return await new Promise((resolve, reject) => {
    let unsub: (() => void) | undefined
    let settled = false
    let txHash = ''

    const cleanup = () => {
      if (unsub) {
        unsub()
        unsub = undefined
      }
    }

    const finish = <T,>(fn: () => T) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      cleanup()
      return fn()
    }

    const timer = setTimeout(() => {
      finish(() => reject(new Error(`${label} timed out before finalization`)))
    }, timeoutMs)

    tx.signAndSend(
      signerAddress,
      { signer: signer as Signer, withSignedTransaction: false },
      (result) => {
        if (settled) return

        txHash = toHexish(result.txHash) ?? txHash

        if ((result.status?.isInBlock || result.status?.isFinalized) && txHash) {
          onTxHash?.(txHash)
        }

        if (result.dispatchError) {
          const message = formatDispatchError(api, result.dispatchError)
          finish(() => reject(new Error(`${label} failed: ${message}`)))
          return
        }

        const failedEvent = result.events?.find(({ event }) =>
          event?.section === 'system' && event?.method === 'ExtrinsicFailed',
        )
        if (failedEvent?.event?.data?.[0]) {
          const message = formatDispatchError(api, failedEvent.event.data[0])
          finish(() => reject(new Error(`${label} failed: ${message}`)))
          return
        }

        if (result.status?.isFinalized) {
          finish(() =>
            resolve({
              txHash,
              blockHash: toHexish(result.status?.asFinalized),
              ok: true,
              events: result.events ?? [],
            }),
          )
        }
      },
    )
      .then((unsubscribe) => {
        unsub = unsubscribe
      })
      .catch((err) => {
        finish(() => reject(err))
      })
  })
}
