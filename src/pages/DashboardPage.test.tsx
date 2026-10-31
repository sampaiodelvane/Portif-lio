import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DEMO_KEYS, readStored, seedDemoSession, seedMessages } from '@/test/demo-backend'
import { jsonResponse, makeRepoDto, mockFetch } from '@/test/github-fixtures'
import { renderRoute } from '@/test/render-route'
import type { ContactMessage, FeaturedProject } from '@/types/contact'

describe('DashboardPage — mensagens', () => {
  it('lista mensagens, filtra não lidas e marca como lida', async () => {
    seedDemoSession()
    seedMessages([
      { id: 'a', subject: 'Proposta de freela' },
      { id: 'b', subject: 'Já lida', readAt: '2026-10-02T00:00:00Z' },
    ])
    const user = userEvent.setup()
    renderRoute('/admin')

    expect(await screen.findByText('Proposta de freela')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Não lidas (1)' }))
    expect(screen.queryByText('Já lida')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Marcar como lida' }))

    expect(await screen.findByText('Tudo lido por aqui.')).toBeInTheDocument()
    const stored = readStored<ContactMessage[]>(DEMO_KEYS.messages)
    expect(stored?.find((m) => m.id === 'a')?.readAt).not.toBeNull()
  })

  it('exclui só depois da confirmação', async () => {
    seedDemoSession()
    seedMessages([{ id: 'a', subject: 'Spam' }])
    const user = userEvent.setup()
    renderRoute('/admin')
    const item = (await screen.findByText('Spam')).closest('article') as HTMLElement

    await user.click(within(item).getByRole('button', { name: 'Excluir' }))
    expect(readStored<ContactMessage[]>(DEMO_KEYS.messages)).toHaveLength(1)
    await user.click(within(item).getByRole('button', { name: 'Confirmar exclusão' }))

    expect(await screen.findByText('Nenhuma mensagem')).toBeInTheDocument()
    expect(readStored<ContactMessage[]>(DEMO_KEYS.messages)).toHaveLength(0)
  })
})

describe('DashboardPage — destaques', () => {
  it('limita a 3 escolhas, salva na ordem e a home passa a exibi-las', async () => {
    seedDemoSession()
    vi.stubEnv('VITE_GITHUB_USERNAME', 'octocat')
    mockFetch([
      {
        match: /\/users\/octocat\/repos/,
        respond: () =>
          jsonResponse(['alfa', 'beta', 'gama', 'delta'].map((name) => makeRepoDto({ name }))),
      },
    ])
    const user = userEvent.setup()
    const { router } = renderRoute('/admin')

    await user.click(await screen.findByRole('checkbox', { name: /gama/ }))
    await user.click(screen.getByRole('checkbox', { name: /alfa/ }))
    await user.click(screen.getByRole('checkbox', { name: /delta/ }))
    expect(screen.getByRole('checkbox', { name: /beta/ })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Salvar destaques' }))
    expect(await screen.findByText('Destaques salvos')).toBeInTheDocument()
    expect(readStored<FeaturedProject[]>(DEMO_KEYS.featured)).toEqual([
      { repoName: 'gama', position: 0 },
      { repoName: 'alfa', position: 1 },
      { repoName: 'delta', position: 2 },
    ])

    await router.navigate('/')
    await screen.findByRole('heading', { level: 1, name: /decisões/ })
    const showcase = await screen.findByRole('region', { name: 'Projetos em destaque' })
    const names = within(showcase)
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent)
    expect(names).toEqual(['gama', 'alfa', 'delta'])
  })
})
