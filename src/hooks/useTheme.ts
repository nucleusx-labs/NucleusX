import { useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('nucleusx-theme')
    return (stored === 'light' || stored === 'dark') ? stored : 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    localStorage.setItem('nucleusx-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')

  return { theme, toggleTheme }
}
