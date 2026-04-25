import { useRef, useState } from 'react'
import { Wallet, X, ChevronRight, Check, Download, LogOut } from 'lucide-react'
import { useConnect } from '../hooks/useConnect'
import type { Wallet as WalletType, WalletAccount } from '@talismn/connect-wallets'

export default function Connect() {
  const modalRef = useRef<HTMLDialogElement>(null)
  const [showOtherWallets, setShowOtherWallets] = useState(false)

  const {
    listAccounts,
    selectedAccount,
    connectedWallet,
    isConnecting,
    installedWallets,
    availableWallets,
    connect,
    selectAccount,
    disconnect,
  } = useConnect()

  function handleSelectAccount(account: WalletAccount) {
    if (account) {
      selectAccount(account)
      modalRef.current?.close()
    }
  }

  function openConnectModal() { modalRef.current?.showModal() }
  function closeConnectModal() { modalRef.current?.close() }
  function toggleOtherWallets() { setShowOtherWallets(!showOtherWallets) }
  function isWalletConnected(wallet: WalletType) { return connectedWallet?.extensionName === wallet.extensionName }
  function isAccountSelected(account: WalletAccount) { return selectedAccount?.address === account.address }

  function formatAddress(address: string, length = 6): string {
    if (!address) return ''
    return `${address.slice(0, length)}…${address.slice(-length)}`
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openConnectModal}
          className={
            selectedAccount
              ? 'flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full border border-ncx-border bg-ncx-surface-2 hover:border-ncx-purple-500 hover:bg-ncx-wash transition-all duration-200'
              : 'btn-ncx btn-ncx-primary'
          }
          style={selectedAccount ? undefined : { padding: '0.55rem 1rem', fontSize: '0.8125rem' }}
        >
          {!selectedAccount ? (
            <>
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Connect</span>
            </>
          ) : (
            <>
              <span
                className="inline-block w-5 h-5 rounded-full"
                style={{ background: 'linear-gradient(135deg, var(--ncx-purple-300), var(--ncx-purple-700) 60%, var(--ncx-gain))' }}
              />
              <span className="hidden sm:inline ncx-num text-xs text-ncx-text">{formatAddress(selectedAccount.address)}</span>
              {connectedWallet?.logo && (
                <img src={connectedWallet.logo.src} alt={connectedWallet.logo.alt} className="w-4 h-4 rounded-sm" />
              )}
            </>
          )}
        </button>

        {selectedAccount && (
          <button
            type="button"
            onClick={disconnect}
            aria-label="Disconnect"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-ncx-border text-ncx-text-muted hover:text-ncx-loss hover:border-ncx-loss/40 hover:bg-ncx-loss/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      <dialog
        ref={modalRef}
        className="modal modal-bottom sm:modal-middle"
        style={{ background: 'transparent', padding: 0 }}
      >
        <div
          className="modal-box w-full max-w-2xl ncx-modal rounded-t-2xl sm:rounded-3xl !p-0 relative"
          style={{ background: 'var(--ncx-surface)' }}
        >
          {/* Soft purple glow */}
          <div
            className="absolute -top-24 -right-24 w-72 h-72 pointer-events-none opacity-50"
            style={{ background: 'radial-gradient(circle, var(--ncx-purple-600), transparent 70%)', borderRadius: 'var(--ncx-r-blob-a)' }}
            aria-hidden="true"
          />

          <div className="relative px-6 pt-6 pb-5 border-b border-ncx-border">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold text-ncx-text tracking-tight">Connect wallet</h2>
              <button
                type="button"
                onClick={closeConnectModal}
                className="p-1.5 rounded-full text-ncx-text-subtle hover:text-ncx-text hover:bg-ncx-wash transition-all duration-150"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-ncx-text-muted">Sign in with a Substrate wallet to start swapping.</p>
          </div>

          <div className="relative px-6 py-5 space-y-6">
            {/* Account Selection */}
            {listAccounts.length > 0 && (
              <div>
                <h3 className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted mb-3">Select account</h3>
                <div className="space-y-2">
                  {listAccounts.map(account => (
                    <button
                      key={account.address}
                      type="button"
                      onClick={() => handleSelectAccount(account)}
                      className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all duration-200 text-left ${
                        isAccountSelected(account)
                          ? 'border-ncx-purple-500 bg-ncx-wash-strong'
                          : 'border-ncx-border bg-ncx-surface-2 hover:border-ncx-purple-500/50 hover:bg-ncx-wash'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-full grid place-items-center text-white font-semibold text-sm shrink-0"
                          style={{ background: 'linear-gradient(135deg, var(--ncx-purple-300), var(--ncx-purple-700))' }}
                        >
                          {account.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ncx-text truncate">{account.name}</p>
                          <p className="ncx-num text-xs text-ncx-text-muted truncate">{formatAddress(account.address)}</p>
                        </div>
                      </div>
                      {isAccountSelected(account) && (
                        <Check className="w-4 h-4 text-ncx-purple-300 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Installed Wallets */}
            {installedWallets.length > 0 && (
              <div>
                <h3 className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted mb-3">Installed wallets</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {installedWallets.map(wallet => (
                    <button
                      key={wallet.extensionName}
                      type="button"
                      onClick={() => connect(wallet)}
                      disabled={isConnecting === wallet.extensionName}
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 text-left ${
                        isWalletConnected(wallet)
                          ? 'border-ncx-purple-500 bg-ncx-wash-strong'
                          : 'border-ncx-border bg-ncx-surface-2 hover:border-ncx-purple-500/50 hover:bg-ncx-wash'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img src={wallet.logo.src} alt={wallet.logo.alt} className="w-9 h-9 rounded-xl" />
                        {isWalletConnected(wallet) && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-ncx-purple-500 rounded-full grid place-items-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ncx-text truncate">{wallet.title}</div>
                        <div className="text-xs text-ncx-text-muted">
                          {isWalletConnected(wallet)
                            ? 'Connected'
                            : isConnecting === wallet.extensionName
                              ? 'Connecting…'
                              : 'Click to connect'}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-ncx-text-subtle shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Available Wallets */}
            {availableWallets.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="ncx-num text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted">Available wallets</h3>
                  <button
                    type="button"
                    onClick={toggleOtherWallets}
                    className="text-xs text-ncx-text-muted hover:text-ncx-text transition-colors duration-150 inline-flex items-center gap-1"
                  >
                    {showOtherWallets ? 'Hide' : 'Show'}
                    <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${showOtherWallets ? 'rotate-90' : ''}`} />
                  </button>
                </div>
                {showOtherWallets && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableWallets.map(wallet => (
                      <a
                        key={wallet.extensionName}
                        href={wallet.installUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-2xl border border-ncx-border bg-ncx-surface-2 hover:border-ncx-purple-500/50 hover:bg-ncx-wash transition-all duration-200"
                      >
                        <img src={wallet.logo.src} alt={wallet.logo.alt} className="w-9 h-9 rounded-xl opacity-60" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-ncx-text truncate">{wallet.title}</div>
                          <div className="text-xs text-ncx-text-muted inline-flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            Install
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative px-6 py-4 border-t border-ncx-border text-xs text-ncx-text-subtle">
            <span className="text-ncx-purple-300 font-medium">Note:</span> Your wallet uses SS58 (Substrate) addresses.
            The first transaction will automatically map your address to an EVM-compatible format.
          </div>
        </div>
        <form method="dialog" className="modal-backdrop" style={{ background: 'color-mix(in srgb, var(--ncx-ink-0) 72%, transparent)', backdropFilter: 'blur(8px)' }}>
          <button type="button">close</button>
        </form>
      </dialog>
    </>
  )
}
