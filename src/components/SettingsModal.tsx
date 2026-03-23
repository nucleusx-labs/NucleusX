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
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-panel rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-200">Transaction Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              Slippage Tolerance
            </label>
            <div className="flex items-center gap-2 border border-white/5 bg-slate-900/40 p-1 rounded-2xl">
              {['0.1', '0.5', '1.0'].map(val => (
                <button
                  key={val}
                  onClick={() => setSlippage(val)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${slippage === val ? 'bg-indigo-600 shadow-md shadow-indigo-500/20 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                >
                  {val}%
                </button>
              ))}
              <div className="relative flex-1">
                <input 
                  type="text"
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-full bg-transparent border-none py-2 px-3 pl-2 pr-6 text-right text-slate-200 focus:outline-none focus:ring-0 transition-all font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 border-t border-white/5 pt-6">
            <label className="text-sm font-semibold text-slate-300">
              Transaction Deadline
            </label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-24 bg-slate-900/50 border border-white/10 rounded-xl py-2 px-3 pr-8 text-right text-slate-200 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs text-right">m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
