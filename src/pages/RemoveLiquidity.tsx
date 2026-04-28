import { ArrowLeft } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import RemoveLiquidityForm from '../components/RemoveLiquidity'

export default function RemoveLiquidity() {
  const [searchParams] = useSearchParams()
  const pairAddress = searchParams.get('pair')

  return (
    <div className="flex flex-col items-center min-h-[70vh] py-8 w-full">
      <div className="w-full max-w-lg ncx-card-soft p-7 relative" style={{ boxShadow: 'var(--ncx-shadow-md)' }}>
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/pools"
            aria-label="Back"
            className="p-2 rounded-full text-ncx-text-subtle hover:text-ncx-text hover:bg-ncx-wash transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h2 className="text-base font-semibold text-ncx-text">Remove liquidity</h2>
          <span className="w-8" />
        </div>

        <RemoveLiquidityForm pairAddress={pairAddress} />
      </div>
    </div>
  )
}
