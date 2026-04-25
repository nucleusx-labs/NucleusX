import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="ncx-card-soft p-10 text-center max-w-lg w-full relative overflow-hidden">
        <div
          className="absolute -top-16 -right-16 w-56 h-56 pointer-events-none opacity-50"
          style={{ background: 'var(--ncx-wash)', borderRadius: 'var(--ncx-r-blob-a)' }}
          aria-hidden="true"
        />
        <div
          className="relative w-14 h-14 rounded-full grid place-items-center mx-auto mb-6"
          style={{ background: 'var(--ncx-wash)' }}
        >
          <Compass className="w-6 h-6 text-ncx-purple-300" />
        </div>
        <h1 className="relative ncx-num text-7xl sm:text-8xl font-medium text-ncx-text tracking-tight mb-3">404</h1>
        <p className="relative text-ncx-text-muted mb-8 max-w-sm mx-auto">
          We couldn't find that page. It might have moved, or perhaps it never existed.
        </p>
        <Link to="/" className="btn-ncx btn-ncx-primary">
          Back to home
        </Link>
      </div>
    </div>
  )
}
