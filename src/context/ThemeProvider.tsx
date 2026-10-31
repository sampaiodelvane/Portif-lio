import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from '@/context/theme-context'
import {
  applyThemeToDocument,
  getSystemTheme,
  readStoredTheme,
  subscribeToSystemTheme,
  writeStoredTheme,
} from '@/lib/theme-storage'
import type { Theme } from '@/types/theme'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [storedTheme, setStoredTheme] = useState<Theme | null>(readStoredTheme)
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme)

  // Escolha explícita do usuário vence; sem escolha, acompanha o sistema operacional.
  const theme = storedTheme ?? systemTheme

  useEffect(() => subscribeToSystemTheme(setSystemTheme), [])

  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    writeStoredTheme(next)
    setStoredTheme(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const value = useMemo(
    () => ({ theme, isExplicit: storedTheme !== null, setTheme, toggleTheme }),
    [theme, storedTheme, setTheme, toggleTheme],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
