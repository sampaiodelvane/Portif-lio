export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  /** true quando o usuário escolheu um tema; false quando segue o sistema. */
  isExplicit: boolean
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}
