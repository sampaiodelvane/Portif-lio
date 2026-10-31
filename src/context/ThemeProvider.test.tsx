import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ThemeProvider } from '@/context/ThemeProvider'
import { THEME_STORAGE_KEY } from '@/lib/theme-storage'
import { mockSystemTheme } from '@/test/match-media'

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

const html = () => document.documentElement

describe('ThemeProvider', () => {
  it('segue o tema do sistema quando não há escolha salva', () => {
    mockSystemTheme(true)
    renderToggle()

    expect(html()).toHaveClass('dark')
    expect(screen.getByRole('button', { name: 'Ativar tema claro' })).toBeInTheDocument()
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
  })

  it('alterna o tema e persiste a escolha no localStorage', async () => {
    mockSystemTheme(false)
    const user = userEvent.setup()
    renderToggle()

    expect(html()).not.toHaveClass('dark')
    await user.click(screen.getByRole('button', { name: 'Ativar tema escuro' }))

    expect(html()).toHaveClass('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(screen.getByRole('button', { name: 'Ativar tema claro' })).toBeInTheDocument()
  })

  it('restaura a escolha salva mesmo com o sistema no tema oposto', () => {
    mockSystemTheme(false)
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    renderToggle()

    expect(html()).toHaveClass('dark')
  })

  it('ignora valor inválido salvo e usa o sistema', () => {
    mockSystemTheme(false)
    localStorage.setItem(THEME_STORAGE_KEY, 'roxo-neon')
    renderToggle()

    expect(html()).not.toHaveClass('dark')
  })

  it('acompanha a mudança do sistema enquanto o usuário não escolheu', () => {
    const system = mockSystemTheme(false)
    renderToggle()

    act(() => system.change(true))
    expect(html()).toHaveClass('dark')
  })

  it('não muda com o sistema depois de uma escolha explícita', async () => {
    const system = mockSystemTheme(false)
    const user = userEvent.setup()
    renderToggle()

    await user.click(screen.getByRole('button', { name: 'Ativar tema escuro' }))
    await user.click(screen.getByRole('button', { name: 'Ativar tema claro' }))
    act(() => system.change(true))

    expect(html()).not.toHaveClass('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
  })
})
