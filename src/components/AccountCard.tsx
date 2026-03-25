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
    <div className="border-2 border-[#2D0A5B] p-6 hover:bg-[#2D0A5B] transition-colors duration-150">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold uppercase tracking-wider text-[#F2F2F2] text-sm">
          {name || '---'}
        </h3>
        {isConnected && (
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#00D084]">
            <div className="w-2 h-2 rounded-full bg-[#00D084]" />
            Live
          </div>
        )}
      </div>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1] mb-1">Current Block</p>
        <div key={currentBlock} className="font-bold text-[#F2F2F2] font-mono text-lg">
          #{currentBlock ? currentBlock.toLocaleString() : '---'}
        </div>
      </div>

      <div className="border-t border-[#2D0A5B] pt-5">
        {address ? (
          <Balance key={address} address={address} chainKey={chainKey} />
        ) : (
          <div className="flex flex-col items-center py-3">
            <span className="icon-[mdi--wallet-plus] text-2xl text-[#A1A1A1] mb-2" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
              Connect wallet for balance
            </p>
          </div>
        )}
      </div>

      {address && (
        <div className="mt-5 border-t border-[#2D0A5B] pt-5 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <a
              href={buyTokenUrl(chainKey, address)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-bold uppercase tracking-widest border border-[#2D0A5B] text-[#A1A1A1] hover:border-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150 text-center"
            >
              Get Tokens
            </a>
            <a
              href={explorerAccount(chainKey, address)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-bold uppercase tracking-widest border border-[#2D0A5B] text-[#A1A1A1] hover:border-[#7B3FE4] hover:text-[#F2F2F2] transition-colors duration-150 text-center flex items-center justify-center gap-1"
            >
              <span className="icon-[mdi--open-in-new]" />
              Explorer
            </a>
          </div>
          {isConnected ? (
            <SignTransaction chainKey={chainKey} />
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
              <span className="icon-[mdi--link-off]" />
              Chain not connected
            </div>
          )}
        </div>
      )}
    </div>
  )
}
