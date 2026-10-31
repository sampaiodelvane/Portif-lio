import { Outlet } from 'react-router'
import { AuthProvider } from '@/context/AuthProvider'

/**
 * Rota "casca" que liga o AuthProvider apenas na área restrita.
 * Carregada com lazy() em app-routes: o código de auth fica fora do bundle inicial.
 */
export function AuthBoundary() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
