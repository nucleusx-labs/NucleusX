import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Swap from './pages/Swap'
import Farms from './pages/Farms'
import Staking from './pages/Staking'
import UserDashboard from './pages/UserDashboard'
import Home from './pages/Home'
import AddLiquidity from './pages/AddLiquidity'

function App() {
  return (
    <div className="min-h-screen bg-[#121212] text-[#e8e8e4] flex flex-col font-brutal selection:bg-[#ff3300]/50 relative">
      {/* Surreal Noise Background */}
      <div className="noise-overlay" />

      <div className="relative z-10 flex flex-col min-h-screen w-full">

      <Header />

      <main className="container grow mx-auto py-8 px-4 sm:px-6 relative z-10 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/farms" element={<Farms />} />
          <Route path="/staking" element={<Staking />} />
          <Route path="/add-liquidity" element={<AddLiquidity />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <div className="relative z-10 mt-auto border-t-[3px] border-black">
        <Footer />
      </div>
    </div>
    </div>
  )
}

export default App
