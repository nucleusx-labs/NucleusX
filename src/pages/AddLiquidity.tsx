import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import AddLiquidityForm from '../components/AddLiquidityForm'

export default function AddLiquidity() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-8 w-full">
      <div className="w-full max-w-lg border-2 border-[#2D0A5B] p-8 relative">
        <Link to="/pools" className="absolute top-8 left-8 text-[#A1A1A1] hover:text-[#F2F2F2] transition-colors duration-150">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold uppercase tracking-widest text-center text-[#F2F2F2] mb-8">Add Liquidity</h2>
        <AddLiquidityForm />
      </div>
    </div>
  )
}
