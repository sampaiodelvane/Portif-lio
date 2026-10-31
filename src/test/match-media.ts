import { vi } from 'vitest'

/** Simula prefers-color-scheme no jsdom (que não implementa matchMedia). */
export function mockSystemTheme(prefersDark: boolean) {
  const listeners = new Set<(event: MediaQueryListEvent) => void>()
  let matches = prefersDark

  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      get matches() {
        return matches
      },
      media: query,
      onchange: null,
      addEventListener: (_: string, cb: (event: MediaQueryListEvent) => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: (event: MediaQueryListEvent) => void) =>
        listeners.delete(cb),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )

  return {
    /** Dispara a troca de tema do sistema operacional. */
    change(nextPrefersDark: boolean) {
      matches = nextPrefersDark
      for (const cb of listeners) cb({ matches } as MediaQueryListEvent)
    },
  }
}
