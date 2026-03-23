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

  function openConnectModal() {
    modalRef.current?.showModal()
  }

  function closeConnectModal() {
    modalRef.current?.close()
  }

  function toggleOtherWallets() {
    setShowOtherWallets(!showOtherWallets)
  }

  function isWalletConnected(wallet: WalletType) {
    return connectedWallet?.extensionName === wallet.extensionName
  }

  function isAccountSelected(account: WalletAccount) {
    return selectedAccount?.address === account.address
  }

  /**
   * Format SS58 address for display (e.g., "15Aa...3f2B")
   */
  function formatAddress(address: string, length = 6): string {
    if (!address) return ''
    return `${address.slice(0, length)}...${address.slice(-length)}`
  }

  return (
    <>
      {/* Connect/Disconnect Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm font-medium transition-all duration-300"
          onClick={openConnectModal}
        >
          {!selectedAccount
            ? (
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:block">Connect Wallet</span>
                </div>
              )
            : (
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <span className="hidden sm:block font-mono">{formatAddress(selectedAccount.address)}</span>
                  {connectedWallet?.logo && (
                    <img
                      src={connectedWallet.logo.src}
                      alt={connectedWallet.logo.alt}
                      className="w-4 h-4 rounded-full"
                    />
                  )}
                </div>
              )}
        </button>

        {/* Disconnect Button (only shown when connected) */}
        {selectedAccount
          ? (
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 glass-panel hover:bg-white/5 text-slate-400 hover:text-slate-200 rounded-xl text-sm transition-all"
                onClick={disconnect}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )
          : null}
      </div>

      {/* Modal using HTML dialog element */}
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-2xl glass-panel !bg-slate-900/95 !border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-200">
              CONNECT WALLET
            </h2>
            <button
              type="button"
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-slate-200"
              onClick={closeConnectModal}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account Selection */}
          {listAccounts.length > 0
            ? (
                <div className="mb-6">
                  <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                    Select Account
                  </h3>
                  <div className="space-y-2">
                    {listAccounts.map(account => (
                      <div
                        key={account.address}
                        className={`card card-compact glass-panel cursor-pointer hover:bg-white/5 transition-all ${
                          isAccountSelected(account)
                            ? '!border-indigo-500/50 bg-indigo-500/5'
                            : '!border-white/5'
                        }`}
                        onClick={() => handleSelectAccount(account)}
                      >
                        <div className="card-body">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                {account.name?.charAt(0).toUpperCase() || 'A'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-200">
                                  {account.name}
                                </p>
                                <p className="text-xs text-slate-500 font-mono">
                                  {formatAddress(account.address)}
                                </p>
                              </div>
                            </div>
                            {isAccountSelected(account)
                              ? (
                                  <div className="w-3 h-3 bg-indigo-500 rounded-full flex items-center justify-center">
                                    <Check className="w-2 h-2 text-white" />
                                  </div>
                                )
                              : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            : null}

          {/* Installed Wallets */}
          {installedWallets.length > 0
            ? (
                <div className="mb-6">
                  <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                    Installed Wallets
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {installedWallets.map(wallet => (
                      <div
                        key={wallet.extensionName}
                        className={`card card-compact glass-panel cursor-pointer transition-all ${
                          isWalletConnected(wallet)
                            ? '!border-green-500/50 bg-green-500/5'
                            : '!border-white/5 hover:!border-indigo-500/50 hover:bg-white/5'
                        }`}
                        onClick={() => connect(wallet)}
                      >
                        <div className="card-body items-center text-center">
                          <div className="relative">
                            <img
                              src={wallet.logo.src}
                              alt={wallet.logo.alt}
                              className="w-12 h-12"
                            />
                            {isWalletConnected(wallet)
                              ? (
                                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <Check className="w-2 h-2 text-white" />
                                  </div>
                                )
                              : null}
                          </div>
                          <div className="text-sm font-bold text-slate-200">
                            {wallet.title}
                          </div>
                          <button
                            type="button"
                            disabled={isConnecting === wallet.extensionName}
                            className={`btn btn-sm w-full mt-2 ${
                              isWalletConnected(wallet)
                                ? 'btn-success'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-none'
                            }`}
                          >
                            {isConnecting === wallet.extensionName
                              ? (
                                  <span className="loading loading-spinner" />
                                )
                              : null}
                            {isWalletConnected(wallet)
                              ? (
                                  'Connected'
                                )
                              : isConnecting === wallet.extensionName
                                ? (
                                    'Connecting...'
                                  )
                                : (
                                    'Connect'
                                  )}
                            {!isWalletConnected(wallet) && isConnecting !== wallet.extensionName
                              ? (
                                  <ChevronRight className="w-4 h-4" />
                                )
                              : null}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            : null}

          {/* Other Wallets */}
          {availableWallets.length > 0
            ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs text-slate-500 uppercase tracking-wider">
                      Available Wallets
                    </h3>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-slate-400 hover:text-slate-200"
                      onClick={toggleOtherWallets}
                    >
                      {showOtherWallets ? 'Hide' : 'Show'}
                      {showOtherWallets
                        ? <ChevronRight className="w-4 h-4 rotate-90" />
                        : <ChevronRight className="w-4 h-4 -rotate-90" />}
                    </button>
                  </div>
                  {showOtherWallets
                    ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                          {availableWallets.map(wallet => (
                            <div
                              key={wallet.extensionName}
                              className="card card-compact glass-panel !border-white/5 hover:!border-indigo-500/50 hover:bg-white/5 transition-all"
                            >
                              <div className="card-body items-center text-center">
                                <img
                                  src={wallet.logo.src}
                                  alt={wallet.logo.alt}
                                  className="w-12 h-12 opacity-60"
                                />
                                <div className="text-xs font-medium text-slate-400">
                                  {wallet.title}
                                </div>
                                <a
                                  href={wallet.installUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline w-full mt-2 border-white/10 text-slate-400 hover:text-slate-200 hover:border-indigo-500/50"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>Install</span>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    : null}
                </div>
              )
            : null}

          {/* Info Note */}
          <div className="mt-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-indigo-400">Note:</span> Your wallet uses SS58 addresses (Substrate format). 
              The first transaction will automatically map your address to an EVM-compatible format.
            </p>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button">close</button>
        </form>
      </dialog>
    </>
  )
}
