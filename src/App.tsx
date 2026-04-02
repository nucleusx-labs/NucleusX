import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './components/Header'
import { subscribeToBlocks } from './utils/sdk-interface'
import { dexStore } from './store/dexStore'
import Footer from './components/Footer'
import Swap from './pages/Swap'
import Farms from './pages/Farms'
import Staking from './pages/Staking'
import UserDashboard from './pages/UserDashboard'
import Home from './pages/Home'
import AddLiquidity from './pages/AddLiquidity'
import Pools from './pages/Pools'
import NotFound from './pages/NotFound'

function App() {
  useEffect(() => {
    let unsub: { unsubscribe: () => void } | undefined
    subscribeToBlocks('qf_network', ({ blockHeight }) => {
      dexStore.send({ type: 'block.update', blockNumber: blockHeight })
    }).then(s => { unsub = s })
    return () => unsub?.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F2F2] flex flex-col" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <Header />
      <main className="grow w-full max-w-360 mx-auto px-4 sm:px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/farms" element={<Farms />} />
          <Route path="/staking" element={<Staking />} />
          <Route path="/pools" element={<Pools />} />
          <Route path="/add-liquidity" element={<AddLiquidity />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
