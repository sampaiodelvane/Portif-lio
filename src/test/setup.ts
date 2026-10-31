import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Sem `globals: true`, a limpeza automática do Testing Library não roda — fazemos explicitamente.
afterEach(() => {
  cleanup()
  localStorage.clear()
})
