import SwapForm from '../components/SwapForm'

export default function Swap() {
  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 relative z-10 px-4">
      <div className="text-center mb-6 sm:mb-8">
        <p className="ncx-num text-[10px] uppercase tracking-[0.22em] text-ncx-purple-300 mb-3">Trade</p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ncx-text">Swap tokens</h1>
        <p className="text-ncx-text-muted text-sm mt-2 max-w-md mx-auto">
          Trade any pair on QF Network with deep liquidity and minimal slippage.
        </p>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-md sticky top-20 sm:top-24">
          <SwapForm />
        </div>
      </div>
    </div>
  )
}
