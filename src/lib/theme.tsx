"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef, type ReactNode } from "react"

type Theme = "dark" | "light"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark"
  const stored = localStorage.getItem("theme")
  if (stored === "light" || stored === "dark") return stored
  return "dark"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)
  const mountedRef = useRef(false)

  useEffect(() => {
    mountedRef.current = true
  }, [])

  useEffect(() => {
    if (!mountedRef.current) return
    const root = document.documentElement
    root.classList.remove("dark", "light")
    root.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
