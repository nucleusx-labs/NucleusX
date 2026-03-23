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
    return `${address.slice(0, length)}...${address.slice(-length)}`
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-brutalist-accent border-[2px] border-black text-black font-black uppercase text-sm shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75"
          onClick={openConnectModal}
        >
          {!selectedAccount ? (
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:block">Connect</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:block font-mono">{formatAddress(selectedAccount.address)}</span>
              {connectedWallet?.logo && (
                <img src={connectedWallet.logo.src} alt={connectedWallet.logo.alt} className="w-4 h-4" />
              )}
            </div>
          )}
        </button>

        {selectedAccount && (
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 border-[2px] border-black text-brutalist-panel-text hover:bg-black hover:text-brutalist-text transition-all duration-75"
            onClick={disconnect}
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-2xl panel-brutal !rounded-none">
          <div className="noise-overlay opacity-20"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-xl font-black uppercase tracking-tight text-brutalist-panel-text">
              Connect Wallet
            </h2>
            <button
              type="button"
              className="p-2 border-[2px] border-transparent hover:border-black text-brutalist-text-muted hover:text-black hover:bg-brutalist-accent transition-all duration-75"
              onClick={closeConnectModal}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account Selection */}
          {listAccounts.length > 0 && (
            <div className="mb-6 relative z-10">
              <h3 className="text-xs text-brutalist-text-muted font-black uppercase tracking-widest mb-3">
                Select Account
              </h3>
              <div className="space-y-2">
                {listAccounts.map(account => (
                  <div
                    key={account.address}
                    className={`border-[2px] cursor-pointer transition-all duration-75 p-4 ${
                      isAccountSelected(account)
                        ? 'border-brutalist-accent bg-[var(--brutalist-accent-10)] shadow-[4px_4px_0_#000]'
                        : 'border-black hover:bg-brutalist-hover'
                    }`}
                    onClick={() => handleSelectAccount(account)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brutalist-accent border-[2px] border-black flex items-center justify-center text-black font-black text-sm shadow-[2px_2px_0_#000]">
                          {account.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase text-brutalist-panel-text">{account.name}</p>
                          <p className="text-xs text-brutalist-text-muted font-mono font-bold">{formatAddress(account.address)}</p>
                        </div>
                      </div>
                      {isAccountSelected(account) && (
                        <div className="w-6 h-6 bg-brutalist-accent border-[2px] border-black flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Installed Wallets */}
          {installedWallets.length > 0 && (
            <div className="mb-6 relative z-10">
              <h3 className="text-xs text-brutalist-text-muted font-black uppercase tracking-widest mb-3">
                Installed Wallets
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {installedWallets.map(wallet => (
                  <div
                    key={wallet.extensionName}
                    className={`border-[2px] cursor-pointer transition-all duration-75 p-4 flex flex-col items-center text-center ${
                      isWalletConnected(wallet)
                        ? 'border-brutalist-accent bg-[var(--brutalist-accent-10)] shadow-[4px_4px_0_#000]'
                        : 'border-black hover:bg-brutalist-hover hover:shadow-[4px_4px_0_#000]'
                    }`}
                    onClick={() => connect(wallet)}
                  >
                    <div className="relative">
                      <img src={wallet.logo.src} alt={wallet.logo.alt} className="w-12 h-12" />
                      {isWalletConnected(wallet) && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-brutalist-accent border-[2px] border-black flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-black uppercase text-brutalist-panel-text mt-2">{wallet.title}</div>
                    <button
                      type="button"
                      disabled={isConnecting === wallet.extensionName}
                      className={`w-full mt-2 px-3 py-1.5 text-xs font-black uppercase border-[2px] border-black transition-all duration-75 ${
                        isWalletConnected(wallet)
                          ? 'bg-brutalist-accent text-black'
                          : 'bg-black text-brutalist-text hover:bg-brutalist-accent hover:text-black'
                      }`}
                    >
                      {isConnecting === wallet.extensionName && <span className="loading loading-spinner loading-xs" />}
                      {isWalletConnected(wallet) ? 'Connected' : isConnecting === wallet.extensionName ? 'Connecting...' : 'Connect'}
                      {!isWalletConnected(wallet) && isConnecting !== wallet.extensionName && (
                        <ChevronRight className="w-3 h-3 inline ml-1" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Wallets */}
          {availableWallets.length > 0 && (
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs text-brutalist-text-muted font-black uppercase tracking-widest">
                  Available Wallets
                </h3>
                <button
                  type="button"
                  className="text-xs font-black uppercase text-brutalist-text-muted hover:text-brutalist-panel-text border-[2px] border-transparent hover:border-black px-2 py-1 transition-all duration-75"
                  onClick={toggleOtherWallets}
                >
                  {showOtherWallets ? 'Hide' : 'Show'}
                  <ChevronRight className={`w-3 h-3 inline ml-1 transition-transform ${showOtherWallets ? 'rotate-90' : '-rotate-90'}`} />
                </button>
              </div>
              {showOtherWallets && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {availableWallets.map(wallet => (
                    <div
                      key={wallet.extensionName}
                      className="border-[2px] border-black p-4 flex flex-col items-center text-center hover:bg-brutalist-hover transition-all duration-75"
                    >
                      <img src={wallet.logo.src} alt={wallet.logo.alt} className="w-12 h-12 opacity-60" />
                      <div className="text-xs font-black uppercase text-brutalist-text-muted mt-2">{wallet.title}</div>
                      <a
                        href={wallet.installUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-2 px-3 py-1.5 text-xs font-black uppercase border-[2px] border-black text-brutalist-panel-text hover:bg-black hover:text-brutalist-text transition-all duration-75 flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Install</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 border-[2px] border-brutalist-accent bg-[var(--brutalist-accent-10)] relative z-10">
            <p className="text-xs text-brutalist-panel-text font-bold">
              <span className="font-black uppercase text-brutalist-accent">Note:</span> Your wallet uses SS58 addresses (Substrate format).
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
