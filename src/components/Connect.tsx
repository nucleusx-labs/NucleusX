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
          className="flex items-center gap-2 px-4 py-2 border border-[#2D0A5B] text-[#A1A1A1] text-sm font-bold uppercase tracking-widest hover:border-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150"
          onClick={openConnectModal}
        >
          {!selectedAccount ? (
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#7B3FE4]" />
              <span className="hidden sm:block">Connect</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#7B3FE4]" />
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
            className="flex items-center gap-2 px-3 py-2 border border-[#2D0A5B] text-[#A1A1A1] hover:border-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150"
            onClick={disconnect}
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-2xl border-2 border-[#2D0A5B] bg-[#0A0A0A] !rounded-none">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold uppercase tracking-widest text-[#F2F2F2]">
              Connect Wallet
            </h2>
            <button
              type="button"
              className="p-1 text-[#A1A1A1] hover:text-[#F2F2F2] transition-colors duration-150"
              onClick={closeConnectModal}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account Selection */}
          {listAccounts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1] mb-3">
                Select Account
              </h3>
              <div className="space-y-2">
                {listAccounts.map(account => (
                  <div
                    key={account.address}
                    className={`border cursor-pointer transition-colors duration-150 p-4 ${
                      isAccountSelected(account)
                        ? 'border-[#7B3FE4] bg-[#2D0A5B]'
                        : 'border-[#2D0A5B] hover:bg-[#2D0A5B]'
                    }`}
                    onClick={() => handleSelectAccount(account)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#2D0A5B] flex items-center justify-center text-[#7B3FE4] font-bold text-sm">
                          {account.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                          <p className="text-sm font-bold uppercase text-[#F2F2F2]">{account.name}</p>
                          <p className="text-xs text-[#A1A1A1] font-mono">{formatAddress(account.address)}</p>
                        </div>
                      </div>
                      {isAccountSelected(account) && (
                        <Check className="w-4 h-4 text-[#7B3FE4]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Installed Wallets */}
          {installedWallets.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1] mb-3">
                Installed Wallets
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {installedWallets.map(wallet => (
                  <div
                    key={wallet.extensionName}
                    className={`border cursor-pointer transition-colors duration-150 p-4 flex flex-col items-center text-center ${
                      isWalletConnected(wallet)
                        ? 'border-[#7B3FE4] bg-[#2D0A5B]'
                        : 'border-[#2D0A5B] hover:bg-[#2D0A5B] hover:border-[#7B3FE4]'
                    }`}
                    onClick={() => connect(wallet)}
                  >
                    <div className="relative">
                      <img src={wallet.logo.src} alt={wallet.logo.alt} className="w-10 h-10" />
                      {isWalletConnected(wallet) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#7B3FE4] flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-[#F2F2F2]" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-bold uppercase text-[#F2F2F2] mt-2">{wallet.title}</div>
                    <button
                      type="button"
                      disabled={isConnecting === wallet.extensionName}
                      className={`w-full mt-2 px-3 py-1.5 text-xs font-bold uppercase border transition-colors duration-150 ${
                        isWalletConnected(wallet)
                          ? 'border-[#7B3FE4] text-[#7B3FE4]'
                          : 'border-[#2D0A5B] text-[#A1A1A1] hover:border-[#7B3FE4] hover:text-[#F2F2F2]'
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
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
                  Available Wallets
                </h3>
                <button
                  type="button"
                  className="text-xs font-bold uppercase text-[#A1A1A1] hover:text-[#F2F2F2] transition-colors duration-150"
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
                      className="border border-[#2D0A5B] p-4 flex flex-col items-center text-center"
                    >
                      <img src={wallet.logo.src} alt={wallet.logo.alt} className="w-10 h-10 opacity-50" />
                      <div className="text-xs font-bold uppercase text-[#A1A1A1] mt-2">{wallet.title}</div>
                      <a
                        href={wallet.installUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-2 px-3 py-1.5 text-xs font-bold uppercase border border-[#2D0A5B] text-[#A1A1A1] hover:border-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150 flex items-center justify-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Install
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 p-4 border border-[#2D0A5B]">
            <p className="text-xs text-[#A1A1A1] font-bold">
              <span className="font-bold uppercase text-[#7B3FE4]">Note:</span> Your wallet uses SS58 addresses (Substrate format).
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
