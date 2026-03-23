import { Link } from 'react-router-dom'
import { Skull } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="bento-box-dark p-12 text-center max-w-lg w-full">
        <div className="noise-overlay opacity-30 invert"></div>
        <div className="relative z-10">
          <Skull className="w-20 h-20 text-brutalist-accent mx-auto mb-6" />
          <h1 className="text-8xl font-black text-brutalist-text tracking-tighter mb-4">404</h1>
          <p className="text-brutalist-text-muted font-black uppercase tracking-widest text-sm mb-8">
            This page has been consumed by the void.
          </p>
          <Link to="/" className="btn-brutal inline-block">
            Return to Safety
          </Link>
        </div>
      </div>
    </div>
  )
}
