import SwapForm from '../components/SwapForm'
import PriceChart from '../components/PriceChart'

export default function Swap() {
  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 lg:py-12 relative z-10">
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Display chart only on larger screens to keep mobile view focused on switching */}
        <div className="hidden lg:block lg:col-span-2 h-[550px]">
          <PriceChart />
        </div>
        <div className="flex justify-center lg:justify-end lg:col-span-1">
          <SwapForm />
        </div>
      </div>
    </div>
  )
}