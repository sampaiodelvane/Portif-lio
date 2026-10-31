import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from '@/App'

describe('App (smoke test da Fase 1)', () => {
  it('renderiza o título principal', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/projetos/i)
  })

  it('usa um landmark <main> para acessibilidade', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
