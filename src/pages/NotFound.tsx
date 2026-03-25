import { Link } from 'react-router-dom'
import { Skull } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="border-2 border-[#2D0A5B] p-12 text-center max-w-lg w-full">
        <Skull className="w-16 h-16 text-[#7B3FE4] mx-auto mb-6" />
        <h1 className="text-9xl font-bold text-[#F2F2F2] tracking-tighter mb-4">404</h1>
        <p className="text-[#A1A1A1] font-bold uppercase tracking-[0.2em] text-sm mb-10">
          This page has been consumed by the void.
        </p>
        <Link
          to="/"
          className="inline-block border-2 border-[#2D0A5B] px-8 py-3 text-sm font-bold uppercase tracking-widest text-[#A1A1A1] hover:bg-[#2D0A5B] hover:text-[#F2F2F2] transition-colors duration-150"
        >
          Return to Safety
        </Link>
      </div>
    </div>
  )
}
