import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Droplets, Repeat, LayoutDashboard, ChevronDown, Sun, Moon } from 'lucide-react'
import Connect from './Connect'
import { useTheme } from '../hooks/useTheme'

export default function Header() {
  const [isTradeMenuOpen, setTradeMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { name: 'Farms', path: '/farms', icon: Droplets },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b-[3px] border-black bg-brutalist-panel text-brutalist-panel-text transition-colors duration-150">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="flex bg-brutalist-accent border-[2px] border-black p-1 shadow-[2px_2px_0_#000] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all duration-75">
              <span className="icon-[token-branded--polkadot] text-xl text-black" />
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter">
              NucleusX
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setTradeMenuOpen(!isTradeMenuOpen)}
                onMouseEnter={() => setTradeMenuOpen(true)}
                onMouseLeave={() => setTradeMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 border-[2px] border-transparent hover:border-black text-sm font-black uppercase transition-all duration-75 hover:bg-black hover:text-white"
              >
                <Repeat className="w-4 h-4" />
                Trade
                <ChevronDown className="w-4 h-4" />
              </button>
              {isTradeMenuOpen && (
                <div
                  onMouseEnter={() => setTradeMenuOpen(true)}
                  onMouseLeave={() => setTradeMenuOpen(false)}
                  className="absolute top-full mt-2 w-48 bg-brutalist-panel border-[3px] border-black shadow-[4px_4px_0_#000]"
                >
                  <NavLink
                    to="/swap"
                    className={({ isActive }) =>
                      `block px-4 py-3 text-sm font-bold uppercase border-b-[2px] border-black ${
                        isActive ? 'bg-brutalist-accent text-black' : 'hover:bg-black hover:text-white'
                      }`
                    }
                  >
                    Exchange
                  </NavLink>
                  <NavLink
                    to="/add-liquidity"
                    className={({ isActive }) =>
                      `block px-4 py-3 text-sm font-bold uppercase border-b-[2px] border-black ${
                        isActive ? 'bg-brutalist-accent text-black' : 'hover:bg-black hover:text-white'
                      }`
                    }
                  >
                    Liquidity
                  </NavLink>
                  <a
                    href="https://example.com/buy-crypto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 text-sm font-bold uppercase hover:bg-black hover:text-white"
                  >
                    Buy Crypto
                  </a>
                </div>
              )}
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 border-2 text-sm font-black uppercase transition-all duration-75 ${
                    isActive
                      ? 'border-black bg-brutalist-accent text-black shadow-[2px_2px_0_#000]'
                      : 'border-transparent hover:border-black hover:bg-black hover:text-white'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 border-[2px] border-black bg-brutalist-accent text-black shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-75"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Connect />
        </div>
      </div>
    </header>
  )
}
