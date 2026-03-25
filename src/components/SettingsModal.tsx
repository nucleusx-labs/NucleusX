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
      <div className="relative w-full max-w-md border-2 border-[#2D0A5B] bg-[#0A0A0A] overflow-hidden">
        <div className="p-5 border-b border-[#2D0A5B] flex items-center justify-between">
          <h3 className="text-base font-bold uppercase tracking-widest text-[#F2F2F2]">Settings</h3>
          <button onClick={onClose} className="p-1 text-[#A1A1A1] hover:text-[#F2F2F2] transition-colors duration-150">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
              Slippage Tolerance
            </label>
            <div className="flex items-center gap-2">
              {['0.1', '0.5', '1.0'].map(val => (
                <button
                  key={val}
                  onClick={() => setSlippage(val)}
                  className={`flex-1 py-2 text-sm font-bold uppercase tracking-widest transition-colors duration-150 ${
                    slippage === val
                      ? 'bg-[#7B3FE4] text-[#F2F2F2]'
                      : 'border border-[#2D0A5B] text-[#A1A1A1] hover:border-[#7B3FE4] hover:bg-[#2D0A5B] hover:text-[#F2F2F2]'
                  }`}
                >
                  {val}%
                </button>
              ))}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-full bg-transparent border border-[#2D0A5B] py-2 px-3 pr-6 text-right text-[#F2F2F2] focus:outline-none focus:border-[#7B3FE4] font-bold text-sm transition-colors duration-150"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1A1] font-bold text-sm">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-[#2D0A5B] pt-6">
            <label className="text-xs font-bold uppercase tracking-[0.2em] text-[#A1A1A1]">
              Transaction Deadline
            </label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-24 bg-transparent border border-[#2D0A5B] py-2 px-3 pr-8 text-right text-[#F2F2F2] focus:outline-none focus:border-[#7B3FE4] font-bold text-sm transition-colors duration-150"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1A1] text-xs font-bold uppercase">m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
