import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DEMO_CREDENTIALS } from '@/lib/backend-error'
import { DEMO_KEYS, seedDemoSession } from '@/test/demo-backend'
import { renderRoute } from '@/test/render-route'

const dashboardHeading = () => screen.findByRole('heading', { level: 1, name: 'Administração' })
const loginHeading = () => screen.findByRole('heading', { level: 1, name: 'Entrar no painel' })

describe('ProtectedRoute — guarda do painel', () => {
  it('redireciona visitante sem sessão de /admin para /login', async () => {
    const { router } = renderRoute('/admin')

    expect(await loginHeading()).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(screen.queryByRole('heading', { name: 'Administração' })).not.toBeInTheDocument()
  })

  it('não deixa entrar com sessão expirada', async () => {
    seedDemoSession({ expired: true })
    const { router } = renderRoute('/admin')

    await loginHeading()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('libera o painel com sessão válida', async () => {
    seedDemoSession()
    const { router } = renderRoute('/admin')

    expect(await dashboardHeading()).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/admin')
  })

  it('após login volta para a página que foi pedida', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/admin?aba=mensagens')
    await loginHeading()

    await user.type(screen.getByLabelText('E-mail'), DEMO_CREDENTIALS.email)
    await user.type(screen.getByLabelText('Senha'), DEMO_CREDENTIALS.password)
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await dashboardHeading()).toBeInTheDocument()
    expect(router.state.location.pathname + router.state.location.search).toBe(
      '/admin?aba=mensagens',
    )
  })

  it('recusa credenciais erradas e continua no login', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/admin')
    await loginHeading()

    await user.type(screen.getByLabelText('E-mail'), DEMO_CREDENTIALS.email)
    await user.type(screen.getByLabelText('Senha'), 'senha-errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos.')
    expect(router.state.location.pathname).toBe('/login')
    expect(localStorage.getItem(DEMO_KEYS.session)).toBeNull()
  })

  it('valida campos do login antes de chamar o backend', async () => {
    const user = userEvent.setup()
    renderRoute('/login')
    await loginHeading()

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Informe o e-mail')).toBeInTheDocument()
    expect(screen.getByText('Informe a senha')).toBeInTheDocument()
  })

  it('usuário já logado em /login vai direto para o painel', async () => {
    seedDemoSession()
    const { router } = renderRoute('/login')

    await dashboardHeading()
    expect(router.state.location.pathname).toBe('/admin')
  })

  it('ao sair, a sessão é apagada e o painel volta a ficar bloqueado', async () => {
    seedDemoSession()
    const user = userEvent.setup()
    const { router } = renderRoute('/admin')
    await dashboardHeading()

    await user.click(screen.getByRole('button', { name: 'Sair' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
    expect(localStorage.getItem(DEMO_KEYS.session)).toBeNull()
  })
})
