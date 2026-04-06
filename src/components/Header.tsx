import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Layers, Repeat, LayoutDashboard, ChevronDown } from 'lucide-react'
import Connect from './Connect'

export default function Header() {
  const [isTradeMenuOpen, setTradeMenuOpen] = useState(false)

  const navItems = [
    { name: 'Pools', path: '/pools', icon: Layers },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2D0A5B] bg-[#0A0A0A]">
      <div className="w-full max-w-360 mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <img src="https://res.cloudinary.com/dma1c8i6n/image/upload/v1775509981/270346914_oknsqn.png" alt="NucleusX" className="w-14 h-14 object-contain" />
            <span className="text-xl font-bold uppercase tracking-tighter text-[#F2F2F2]">
              NucleusX
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <div
              className="relative"
              onMouseEnter={() => setTradeMenuOpen(true)}
              onMouseLeave={() => setTradeMenuOpen(false)}
            >
              <button
                onClick={() => setTradeMenuOpen(v => !v)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-widest text-[#A1A1A1] hover:text-[#F2F2F2] transition-colors duration-150"
              >
                <Repeat className="w-4 h-4" />
                Trade
                <ChevronDown className="w-4 h-4" />
              </button>
              {isTradeMenuOpen && (
                <div className="absolute top-full w-44 pt-1">
                  <div className="bg-[#0A0A0A] border border-[#2D0A5B]">
                    <NavLink
                      to="/swap"
                      onClick={() => setTradeMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors duration-150 ${
                          isActive ? 'bg-[#2D0A5B] text-[#F2F2F2]' : 'text-[#A1A1A1] hover:text-[#F2F2F2] hover:bg-[#2D0A5B]'
                        }`
                      }
                    >
                      Exchange
                    </NavLink>
                  </div>
                </div>
              )}
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-widest transition-colors duration-150 ${
                    isActive
                      ? 'text-[#F2F2F2] bg-[#2D0A5B]'
                      : 'text-[#A1A1A1] hover:text-[#F2F2F2] hover:bg-[#2D0A5B]'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <Connect />
      </div>
    </header>
  )
}
