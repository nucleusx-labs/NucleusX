import { X } from 'lucide-react'
import { useState } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [slippage, setSlippage] = useState('0.5')
  const [deadline, setDeadline] = useState('20')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-md panel-brutal overflow-hidden flex flex-col">
        <div className="noise-overlay opacity-20"></div>
        <div className="p-4 border-b-[3px] border-black flex items-center justify-between relative z-10">
          <h3 className="text-xl font-black uppercase tracking-tight text-brutalist-panel-text">Settings</h3>
          <button onClick={onClose} className="p-2 border-[2px] border-transparent hover:border-black text-brutalist-text-muted hover:text-black hover:bg-brutalist-accent transition-all duration-75">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6 relative z-10">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-widest text-brutalist-panel-text">
              Slippage Tolerance
            </label>
            <div className="flex items-center gap-2 border-[2px] border-black p-1 bg-brutalist-input-bg">
              {['0.1', '0.5', '1.0'].map(val => (
                <button
                  key={val}
                  onClick={() => setSlippage(val)}
                  className={`flex-1 py-2 text-sm font-black uppercase transition-all duration-75 ${slippage === val ? 'bg-brutalist-accent text-black shadow-[2px_2px_0_#000] border-[2px] border-black' : 'text-brutalist-text-muted hover:text-brutalist-panel-text hover:bg-brutalist-hover border-[2px] border-transparent'}`}
                >
                  {val}%
                </button>
              ))}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-full bg-transparent border-none py-2 px-3 pl-2 pr-6 text-right text-brutalist-panel-text focus:outline-none font-mono font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brutalist-text-muted font-black">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t-[2px] border-black pt-6">
            <label className="text-xs font-black uppercase tracking-widest text-brutalist-panel-text">
              Transaction Deadline
            </label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-24 bg-brutalist-input-bg border-[2px] border-black py-2 px-3 pr-8 text-right text-brutalist-panel-text focus:outline-none font-mono font-bold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brutalist-text-muted text-xs font-black uppercase">m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
