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
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative w-full max-w-lg border-2 border-[#2D0A5B] bg-[#0A0A0A]">
        <div className="p-5 border-b border-[#2D0A5B] flex items-center justify-between">
          <h3 className="text-base font-bold uppercase tracking-widest text-[#F2F2F2]">Search</h3>
          <button onClick={onClose} className="p-1 text-[#A1A1A1] hover:text-[#F2F2F2] transition-colors duration-150">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1A1]" />
            <input
              type="text"
              autoFocus
              placeholder="Search by name, symbol or address"
              className="w-full bg-transparent border-b-2 border-[#7B3FE4] py-3 pl-10 pr-4 text-[#F2F2F2] placeholder:text-[#A1A1A1]/50 focus:outline-none font-bold text-sm uppercase tracking-wider"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="mt-8 text-center py-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#A1A1A1]/50">Start typing to search...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
