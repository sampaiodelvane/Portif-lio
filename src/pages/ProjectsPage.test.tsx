import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { jsonResponse, makeRepoDto, mockFetch } from '@/test/github-fixtures'
import { renderRoute } from '@/test/render-route'

const REPOS_URL = /\/users\/octocat\/repos/

describe('ProjectsPage', () => {
  it('mostra skeleton enquanto carrega e depois os cards com link canônico', async () => {
    vi.stubEnv('VITE_GITHUB_USERNAME', 'octocat')
    mockFetch([
      {
        match: REPOS_URL,
        respond: () => jsonResponse([makeRepoDto({ name: 'portfolio', description: 'Meu site' })]),
      },
    ])
    renderRoute('/projetos')

    expect(await screen.findByText('Carregando projetos…')).toBeInTheDocument()
    const link = await screen.findByRole('link', { name: 'portfolio' })
    expect(link).toHaveAttribute('href', '/projetos/portfolio')
    expect(screen.getByText('Meu site')).toBeInTheDocument()
  })

  it('trata lista vazia', async () => {
    vi.stubEnv('VITE_GITHUB_USERNAME', 'octocat')
    mockFetch([{ match: REPOS_URL, respond: () => jsonResponse([]) }])
    renderRoute('/projetos')

    expect(await screen.findByText('Nenhum repositório público ainda')).toBeInTheDocument()
  })

  it('avisa quando VITE_GITHUB_USERNAME não está configurado, sem chamar a API', async () => {
    const fetchMock = mockFetch([])
    renderRoute('/projetos')

    expect(await screen.findByText('Usuário do GitHub não configurado')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('explica o rate limit sem oferecer retry (que gastaria mais cota)', async () => {
    vi.stubEnv('VITE_GITHUB_USERNAME', 'octocat')
    mockFetch([
      {
        match: REPOS_URL,
        respond: () => jsonResponse({}, { status: 403, headers: { 'x-ratelimit-remaining': '0' } }),
      },
    ])
    renderRoute('/projetos')

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Limite da API do GitHub atingido')
    expect(within(alert).queryByRole('button')).not.toBeInTheDocument()
  })

  it('permite tentar de novo após erro do servidor', async () => {
    vi.stubEnv('VITE_GITHUB_USERNAME', 'octocat')
    let call = 0
    mockFetch([
      {
        match: REPOS_URL,
        respond: () =>
          call++ === 0
            ? jsonResponse({}, { status: 500 })
            : jsonResponse([makeRepoDto({ name: 'voltou' })]),
      },
    ])
    const user = userEvent.setup()
    renderRoute('/projetos')

    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByRole('link', { name: 'voltou' })).toBeInTheDocument()
  })

  it('filtra pela busca e guarda o filtro na URL', async () => {
    vi.stubEnv('VITE_GITHUB_USERNAME', 'octocat')
    mockFetch([
      {
        match: REPOS_URL,
        respond: () =>
          jsonResponse([makeRepoDto({ name: 'portfolio' }), makeRepoDto({ name: 'iot-esp32' })]),
      },
    ])
    const user = userEvent.setup()
    const { router } = renderRoute('/projetos')

    await user.type(await screen.findByRole('searchbox', { name: 'Buscar projetos' }), 'iot')

    expect(screen.getByRole('link', { name: 'iot-esp32' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'portfolio' })).not.toBeInTheDocument()
    expect(screen.getByText('1 de 2 projetos')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?q=iot')
  })
})

describe('ProjectDetailPage', () => {
  it('mostra detalhes, linguagens e link externo seguro', async () => {
    vi.stubEnv('VITE_GITHUB_USERNAME', 'octocat')
    mockFetch([
      { match: /\/languages$/, respond: () => jsonResponse({ TypeScript: 900, CSS: 100 }) },
      {
        match: /\/repos\/octocat\/portfolio$/,
        respond: () =>
          jsonResponse(
            makeRepoDto({ name: 'portfolio', homepage: 'portfolio.dev', topics: ['react'] }),
          ),
      },
    ])
    renderRoute('/projetos/portfolio')

    expect(await screen.findByRole('heading', { level: 1, name: 'portfolio' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver demo/i })).toHaveAttribute(
      'href',
      'https://portfolio.dev/',
    )
    expect(await screen.findByText('90%')).toBeInTheDocument()
    expect(screen.getByText('react')).toBeInTheDocument()
  })

  it('mostra "projeto não encontrado" para repositório inexistente', async () => {
    vi.stubEnv('VITE_GITHUB_USERNAME', 'octocat')
    mockFetch([{ match: /.*/, respond: () => jsonResponse({}, { status: 404 }) }])
    renderRoute('/projetos/fantasma')

    expect(await screen.findByText('Projeto não encontrado')).toBeInTheDocument()
  })
})
