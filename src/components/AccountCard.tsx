import type { Prefix } from '../utils/sdk'
import { useCurrentBlock } from '../hooks/useCurrentBlock'
import { buyTokenUrl, explorerAccount } from '../utils/formatters'
import Balance from './Balance'
import SignTransaction from './SignTransaction'

interface AccountCardProps {
  chainKey: Prefix
  address?: string
}

export default function AccountCard({ chainKey, address }: AccountCardProps) {
  const { name, currentBlock, isConnected } = useCurrentBlock(chainKey)

  return (
    <div className="group bento-box p-4 hover:shadow-[8px_8px_0px_#000] transition-all duration-75">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black uppercase tracking-wider text-brutalist-panel-text">
          {name || '---'}
        </h3>
        {/* Orange for live status badge */}
        {isConnected && (
          <div className="text-xs px-2 py-1 bg-brutalist-orange text-black border-[2px] border-black font-black uppercase tracking-widest flex items-center gap-1 shadow-[2px_2px_0_#000]">
            <span className="icon-[mdi--check-circle] text-xs" />
            Live
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-xs text-brutalist-text-muted font-black uppercase tracking-widest mb-1">
          Current Block
        </div>
        <div key={currentBlock} className="font-black text-brutalist-panel-text font-mono text-lg block-highlight">
          #{currentBlock ? currentBlock.toLocaleString() : '---'}
        </div>
      </div>

      <div className="border-t-[2px] border-black pt-4">
        {address ? (
          <Balance key={address} address={address} chainKey={chainKey} />
        ) : (
          <div className="flex flex-col items-center py-3">
            <span className="icon-[mdi--wallet-plus] text-2xl text-brutalist-text-muted mb-2" />
            <p className="text-xs text-brutalist-text-muted font-black uppercase tracking-widest">
              Connect wallet for balance
            </p>
          </div>
        )}
      </div>

      {address && (
        <div className="mt-4">
          <div className="pt-3 border-t-[2px] border-black">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <a href={buyTokenUrl(chainKey, address)} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-black uppercase tracking-widest border-[2px] border-black text-brutalist-panel-text hover:bg-black hover:text-brutalist-text transition-all duration-75 text-center">
                Get Tokens
              </a>
              <a href={explorerAccount(chainKey, address)} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-xs font-black uppercase tracking-widest border-[2px] border-black text-brutalist-panel-text hover:bg-black hover:text-brutalist-text transition-all duration-75 text-center flex items-center justify-center gap-1">
                <span className="icon-[mdi--open-in-new]" />
                Explorer
              </a>
            </div>
            {isConnected ? (
              <SignTransaction chainKey={chainKey} />
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs text-brutalist-text-muted font-black uppercase tracking-widest">
                <span className="icon-[mdi--link-off]" />
                Chain not connected
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
