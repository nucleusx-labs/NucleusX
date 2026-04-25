import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Layers, Repeat, LayoutDashboard, ChevronDown, Menu, X, Sun, Moon } from 'lucide-react'
import Connect from './Connect'
import { useTheme } from '../hooks/useTheme'

const LOGO_URL = 'https://res.cloudinary.com/dma1c8i6n/image/upload/v1775509981/270346914_oknsqn.png'

export default function Header() {
  const [isTradeMenuOpen, setTradeMenuOpen] = useState(false)
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { name: 'Pools', path: '/pools', icon: Layers },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ]

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-ncx-wash-strong text-ncx-text'
        : 'text-ncx-text-muted hover:bg-ncx-wash hover:text-ncx-text'
    }`

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-ncx-border"
      style={{ background: 'color-mix(in srgb, var(--ncx-bg) 88%, transparent)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
    >
      <div className="w-full max-w-[1400px] mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 group" onClick={closeMobileMenu}>
            <img
              src={LOGO_URL}
              alt="NucleusX"
              className="w-9 h-9 object-contain transition-transform duration-300 group-hover:rotate-6"
            />
            <span className="text-lg font-semibold tracking-tight text-ncx-text">
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
                className={navLinkClass(false)}
              >
                <Repeat className="w-4 h-4" />
                Trade
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isTradeMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {isTradeMenuOpen && (
                <div className="absolute top-full left-0 w-44 pt-2">
                  <div
                    className="rounded-2xl border border-ncx-border-strong bg-ncx-surface p-1.5"
                    style={{ boxShadow: 'var(--ncx-shadow-lg)' }}
                  >
                    <NavLink
                      to="/swap"
                      onClick={() => setTradeMenuOpen(false)}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                          isActive
                            ? 'bg-ncx-wash-strong text-ncx-text'
                            : 'text-ncx-text-muted hover:bg-ncx-wash hover:text-ncx-text'
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
                className={({ isActive }) => navLinkClass(isActive)}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full border border-ncx-border text-ncx-text-muted hover:text-ncx-text hover:bg-ncx-wash transition-all duration-200"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Connect />
          {/* Hamburger button */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-ncx-border text-ncx-text-muted hover:text-ncx-text hover:bg-ncx-wash transition-all duration-200"
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-ncx-border bg-ncx-surface">
          <nav className="flex flex-col px-4 py-3 gap-1">
            <button
              onClick={() => setTradeMenuOpen(v => !v)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-ncx-text-muted hover:text-ncx-text hover:bg-ncx-wash transition-colors"
            >
              <span className="flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                Trade
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isTradeMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {isTradeMenuOpen && (
              <NavLink
                to="/swap"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `block ml-7 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-ncx-wash-strong text-ncx-text' : 'text-ncx-text-muted hover:bg-ncx-wash hover:text-ncx-text'
                  }`
                }
              >
                Exchange
              </NavLink>
            )}
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive ? 'bg-ncx-wash-strong text-ncx-text' : 'text-ncx-text-muted hover:bg-ncx-wash hover:text-ncx-text'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-ncx-text-muted hover:text-ncx-text hover:bg-ncx-wash transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
