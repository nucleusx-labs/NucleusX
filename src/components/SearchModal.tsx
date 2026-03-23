import { X, Search } from 'lucide-react'
import { useState } from 'react'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-lg panel-brutal overflow-hidden flex flex-col">
        <div className="noise-overlay opacity-20"></div>
        <div className="p-4 border-b-[3px] border-black flex items-center justify-between relative z-10">
          <h3 className="text-xl font-black uppercase tracking-tight text-brutalist-panel-text">Search Tokens & Pairs</h3>
          <button onClick={onClose} className="p-2 border-[2px] border-transparent hover:border-black text-brutalist-text-muted hover:text-black hover:bg-brutalist-accent transition-all duration-75">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 relative z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brutalist-text-muted" />
            <input
              type="text"
              autoFocus
              placeholder="Search by name, symbol or paste address"
              className="w-full bg-brutalist-input-bg border-[2px] border-black py-4 pl-11 pr-4 text-brutalist-panel-text placeholder:text-brutalist-text-muted focus:outline-none font-bold text-sm uppercase tracking-wider"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="mt-6 text-center py-8">
            <p className="text-sm font-black uppercase tracking-widest text-brutalist-text-muted">Start typing to search...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
