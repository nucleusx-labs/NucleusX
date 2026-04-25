import { useAtom } from '@xstate/store/react'
import { X } from 'lucide-react'
import { swapSettings } from '../store/swapSettings'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { slippage, deadline } = useAtom(swapSettings)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'color-mix(in srgb, var(--ncx-ink-0) 72%, transparent)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-md ncx-modal rounded-t-2xl sm:rounded-3xl"
        style={{ animation: 'fadeUp 0.32s var(--ncx-ease-out)' }}
      >
        <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-ncx-border">
          <h3 className="text-base font-semibold text-ncx-text">Settings</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-ncx-text-subtle hover:text-ncx-text hover:bg-ncx-wash transition-all duration-150"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="space-y-3">
            <label className="ncx-num block text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted">
              Slippage tolerance
            </label>
            <div className="flex items-center gap-2">
              {['0.1', '0.5', '1.0'].map(val => (
                <button
                  key={val}
                  onClick={() => swapSettings.set({ ...swapSettings.get(), slippage: val })}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                    slippage === val
                      ? 'bg-ncx-purple-500 text-white'
                      : 'border border-ncx-border text-ncx-text-muted hover:border-ncx-purple-500 hover:text-ncx-text hover:bg-ncx-wash'
                  }`}
                  style={slippage !== val ? { background: 'var(--ncx-surface-2)' } : undefined}
                >
                  {val}%
                </button>
              ))}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={slippage}
                  onChange={e => swapSettings.set({ ...swapSettings.get(), slippage: e.target.value })}
                  className="ncx-input pr-7 text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ncx-text-muted text-sm">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-ncx-border pt-5">
            <label className="ncx-num block text-[10px] uppercase tracking-[0.14em] text-ncx-text-muted">
              Transaction deadline
            </label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={deadline}
                  onChange={e => swapSettings.set({ ...swapSettings.get(), deadline: e.target.value })}
                  className="ncx-input w-28 pr-9 text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ncx-text-muted ncx-num text-xs uppercase">min</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
