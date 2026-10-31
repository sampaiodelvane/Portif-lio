import { Navigate, Outlet, useLocation } from 'react-router'
import { PageSkeleton } from '@/components/PageSkeleton'
import { useAuth } from '@/hooks/useAuth'
import { ROUTE_PATHS } from '@/routes/route-paths'

export interface RedirectState {
  from?: string
}

/**
 * Guarda das rotas do painel.
 * - verificando sessão → skeleton (sem "piscar" a tela de login)
 * - sem sessão → /login, lembrando a URL pedida para voltar depois
 * - com sessão → renderiza a rota filha
 */
export function ProtectedRoute() {
  const { state } = useAuth()
  const location = useLocation()

  if (state.status === 'loading') return <PageSkeleton />

  if (state.status === 'unauthenticated') {
    const redirectState: RedirectState = {
      from: location.pathname + location.search + location.hash,
    }
    return <Navigate to={ROUTE_PATHS.login} replace state={redirectState} />
  }

  return <Outlet />
}
