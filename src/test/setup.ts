import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom não implementa scrollTo (usado pelo <ScrollRestoration />).
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

// Sem `globals: true`, a limpeza automática do Testing Library não roda — fazemos explicitamente.
afterEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.removeAttribute('style')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
