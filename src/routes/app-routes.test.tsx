import { render, screen } from '@testing-library/react'
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { RouteErrorPage } from '@/components/RouteErrorPage'
import { ThemeProvider } from '@/context/ThemeProvider'
import { appRoutes } from '@/routes/app-routes'
import { projectPath } from '@/routes/route-paths'

function renderAt(path: string, routes: RouteObject[] = appRoutes) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>,
  )
  return router
}

describe('árvore de rotas', () => {
  it('carrega a home (lazy) dentro do layout', async () => {
    renderAt('/')

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/projetos/i)
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
  })

  it('marca o link ativo com aria-current', async () => {
    renderAt('/projetos')

    await screen.findByRole('heading', { level: 1, name: 'Projetos' })
    expect(screen.getByRole('link', { name: 'Projetos' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Início' })).not.toHaveAttribute('aria-current')
  })

  it('resolve a URL canônica /projetos/:repoName', async () => {
    renderAt(projectPath('meu-repo'))

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('meu-repo')
  })

  it('mostra a página 404 para rota desconhecida, mantendo o layout', async () => {
    renderAt('/rota/que-nao-existe')

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
  })
})

let errorToThrow = new Error('não configurado')

function Boom(): never {
  throw errorToThrow
}

describe('RouteErrorPage', () => {
  function routesThatThrow(error: Error): RouteObject[] {
    errorToThrow = error
    return [{ path: '/', element: <Boom />, errorElement: <RouteErrorPage /> }]
  }

  it('mostra mensagem amigável quando uma página quebra', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderAt('/', routesThatThrow(new Error('falha qualquer')))

    expect(await screen.findByRole('alert')).toHaveTextContent('Algo deu errado')
    expect(screen.getByRole('button', { name: 'Recarregar' })).toBeInTheDocument()
  })

  it('identifica falha ao baixar chunk (deploy novo) e sugere recarregar', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderAt(
      '/',
      routesThatThrow(new TypeError('Failed to fetch dynamically imported module: /assets/x.js')),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Uma nova versão do site foi publicada',
    )
  })
})
