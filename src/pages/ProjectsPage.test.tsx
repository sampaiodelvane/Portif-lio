import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PORTFOLIO_PROJECTS } from '@/content/projects'
import { jsonResponse, makeRepoDto, mockFetch } from '@/test/github-fixtures'
import { renderRoute } from '@/test/render-route'

const TOTAL = PORTFOLIO_PROJECTS.length
const REPOS_URL = /\/users\/sampaiodelvane\/repos/

const cardFor = async (title: string) =>
  (await screen.findByRole('link', { name: title })).closest('article') as HTMLElement

describe('ProjectsPage — vitrine curada', () => {
  it('lista o catálogo na hora, com nomes de exibição e URL canônica, sem depender da API', async () => {
    const fetchMock = mockFetch([])
    renderRoute('/projetos')

    expect(await screen.findByRole('link', { name: 'Página de Vinhos' })).toHaveAttribute(
      'href',
      '/projetos/pagina-de-vinhos',
    )
    expect(screen.getByRole('link', { name: 'Novo TV Time' })).toHaveAttribute(
      'href',
      '/projetos/novo-tv-time',
    )
    expect(screen.getByText(`${TOTAL} de ${TOTAL} projetos`)).toBeInTheDocument()
    // Sem VITE_GITHUB_USERNAME a API nem é chamada.
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('marca projetos privados e complementa os públicos com dados do GitHub', async () => {
    vi.stubEnv('VITE_GITHUB_USERNAME', 'sampaiodelvane')
    mockFetch([
      {
        match: REPOS_URL,
        respond: () =>
          jsonResponse([
            makeRepoDto({ name: 'CHP4-WebDevelopment', stargazers_count: 12 }),
            // Mesmo que a API devolvesse um repo com nome de um privado, ele não é usado.
            makeRepoDto({ name: 'gb-higienizacoes', stargazers_count: 999 }),
          ]),
      },
    ])
    renderRoute('/projetos')

    const tvTime = await cardFor('Novo TV Time')
    expect(await within(tvTime).findByText('12')).toBeInTheDocument()
    const gb = await cardFor('G&B Higienizações')
    expect(within(gb).getByText('Código privado')).toBeInTheDocument()
    expect(within(gb).queryByText('999')).not.toBeInTheDocument()
  })

  it('com a cota do GitHub esgotada, a vitrine continua completa e sem erro', async () => {
    vi.stubEnv('VITE_GITHUB_USERNAME', 'sampaiodelvane')
    mockFetch([
      {
        match: REPOS_URL,
        respond: () => jsonResponse({}, { status: 403, headers: { 'x-ratelimit-remaining': '0' } }),
      },
    ])
    renderRoute('/projetos')

    const vinhos = await cardFor('Página de Vinhos')
    expect(await within(vinhos).findByText('Código aberto no GitHub')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(TOTAL)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('busca em descrição/funcionalidades e guarda o filtro na URL', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/projetos')

    await user.type(await screen.findByRole('searchbox', { name: 'Buscar projetos' }), 'satélite')

    expect(screen.getByRole('link', { name: 'TerraVis' })).toBeInTheDocument()
    expect(screen.getByText(`1 de ${TOTAL} projetos`)).toBeInTheDocument()
    expect(router.state.location.search).toBe('?q=sat%C3%A9lite')
  })

  it('filtra por tecnologia e permite limpar quando nada corresponde', async () => {
    const user = userEvent.setup()
    renderRoute('/projetos?tech=Supabase')

    expect(await screen.findByRole('link', { name: 'G&B Higienizações' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(1)

    await user.type(screen.getByRole('searchbox', { name: 'Buscar projetos' }), 'zzz')
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }))

    expect(screen.getAllByRole('article')).toHaveLength(TOTAL)
  })
})

describe('ProjectDetailPage', () => {
  it('projeto público: funcionalidades, link do código, linguagens e estatísticas', async () => {
    vi.stubEnv('VITE_GITHUB_USERNAME', 'sampaiodelvane')
    mockFetch([
      { match: /\/languages$/, respond: () => jsonResponse({ JavaScript: 900, CSS: 100 }) },
      {
        match: REPOS_URL,
        respond: () =>
          jsonResponse([
            makeRepoDto({
              name: 'CHP4-WebDevelopment',
              html_url: 'https://github.com/sampaiodelvane/CHP4-WebDevelopment',
            }),
          ]),
      },
    ])
    renderRoute('/projetos/novo-tv-time')

    expect(await screen.findByRole('heading', { level: 1, name: 'Novo TV Time' })).toBeVisible()
    expect(document.title).toBe('Novo TV Time · Portfólio')
    const features = screen.getByRole('region', { name: 'Funcionalidades' })
    expect(within(features).getAllByRole('listitem').length).toBeGreaterThanOrEqual(3)
    expect(screen.getByRole('link', { name: /ver código no github/i })).toHaveAttribute(
      'href',
      'https://github.com/sampaiodelvane/CHP4-WebDevelopment',
    )
    expect(await screen.findByText('90%')).toBeInTheDocument()
    expect(await screen.findByText('Último push')).toBeInTheDocument()
  })

  it('projeto privado: sem link de código e sem consultar a API de linguagens', async () => {
    vi.stubEnv('VITE_GITHUB_USERNAME', 'sampaiodelvane')
    const fetchMock = mockFetch([{ match: REPOS_URL, respond: () => jsonResponse([]) }])
    renderRoute('/projetos/gb-higienizacoes')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'G&B Higienizações' }),
    ).toBeVisible()
    expect(screen.getByText(/Código-fonte privado/)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument()
    const calledUrls = fetchMock.mock.calls.map(([url]) => String(url))
    expect(calledUrls.some((url) => url.includes('/languages'))).toBe(false)
  })

  it.each([
    ['terravis', 'https://sampaiodelvane.github.io/TerraVis/'],
    [
      'pagina-de-vinhos',
      'https://sampaiodelvane.github.io/Landing-Page---Tema-Livre-CHP-Front-End-Design-/',
    ],
    ['gb-higienizacoes', 'https://gb-higienizacoes.vercel.app/'],
  ])('mostra o link publicado de /projetos/%s', async (slug, liveUrl) => {
    renderRoute(`/projetos/${slug}`)

    expect(await screen.findByRole('link', { name: /ver online/i })).toHaveAttribute(
      'href',
      liveUrl,
    )
  })

  it('nome de exibição diferente do repositório: Escala Rede 7 em /projetos/escala-rede-7', async () => {
    renderRoute('/projetos/escala-rede-7')

    expect(await screen.findByRole('heading', { level: 1, name: 'Escala Rede 7' })).toBeVisible()
    const features = screen.getByRole('region', { name: 'Funcionalidades' })
    expect(within(features).getByText(/Senior 00800/)).toBeInTheDocument()
    expect(screen.getByText(/Código-fonte privado/)).toBeInTheDocument()
  })

  it('slug inexistente mostra "projeto não encontrado"', async () => {
    renderRoute('/projetos/fantasma')

    expect(await screen.findByText('Projeto não encontrado')).toBeInTheDocument()
  })
})
