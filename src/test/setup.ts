import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// jsdom não implementa scrollTo (usado pelo <ScrollRestoration />).
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

beforeEach(() => {
  // Isola os testes do .env.local da máquina: cada teste declara o que precisa.
  vi.stubEnv('VITE_GITHUB_USERNAME', '')
  // Nenhum teste pode bater na API real. Quem precisa de rede usa mockFetch().
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.reject(new Error('fetch não mockado neste teste'))),
  )
})

// Sem `globals: true`, a limpeza automática do Testing Library não roda — fazemos explicitamente.
afterEach(() => {
  cleanup()
  localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.removeAttribute('style')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})
