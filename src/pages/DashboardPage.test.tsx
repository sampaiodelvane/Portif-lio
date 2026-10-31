import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DEMO_KEYS, readStored, seedDemoSession, seedMessages } from '@/test/demo-backend'
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
    const user = userEvent.setup()
    const { router } = renderRoute('/admin')

    // Opções vêm do catálogo (com os nomes de exibição), inclusive projetos privados.
    await user.click(await screen.findByRole('checkbox', { name: /TerraVis/ }))
    await user.click(screen.getByRole('checkbox', { name: /G&B Higienizações/ }))
    await user.click(screen.getByRole('checkbox', { name: /Adega Bordô/ }))
    expect(screen.getByRole('checkbox', { name: /Novo TV Time/ })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Salvar destaques' }))
    expect(await screen.findByText('Destaques salvos')).toBeInTheDocument()
    expect(readStored<FeaturedProject[]>(DEMO_KEYS.featured)).toEqual([
      { slug: 'terravis', position: 0 },
      { slug: 'gb-higienizacoes', position: 1 },
      { slug: 'adega-bordo', position: 2 },
    ])

    await router.navigate('/')
    await screen.findByRole('heading', { level: 1, name: /decisões/ })
    const showcase = await screen.findByRole('region', { name: 'Projetos em destaque' })
    const names = within(showcase)
      .getAllByRole('heading', { level: 3 })
      .map((h) => h.textContent)
    expect(names).toEqual(['TerraVis', 'G&B Higienizações', 'Adega Bordô'])
  })

  it('sem destaques salvos, a home mostra os três primeiros do catálogo', async () => {
    renderRoute('/')

    const showcase = await screen.findByRole('region', { name: 'Projetos em destaque' })
    const names = (await within(showcase).findAllByRole('heading', { level: 3 })).map(
      (h) => h.textContent,
    )
    expect(names).toEqual([
      'Gestão de Vendas e Serviços - Empresa de Monitoramento',
      'G&B Higienizações',
      'Adega Bordô',
    ])
  })
})
