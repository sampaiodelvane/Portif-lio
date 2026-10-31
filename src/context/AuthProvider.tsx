import { useQueryClient } from '@tanstack/react-query'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '@/context/auth-context'
import { getBackendMode, loadAdminBackend } from '@/services/backend'
import type { AuthState, AuthUser } from '@/types/auth'

const toState = (user: AuthUser | null): AuthState =>
  user ? { status: 'authenticated', user } : { status: 'unauthenticated', user: null }

/**
 * Montado só nas rotas /login e /admin (ver app-routes): visitantes comuns
 * nunca baixam o código de autenticação nem o supabase-js.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null })

  useEffect(() => {
    let active = true
    let unsubscribe = () => {}

    loadAdminBackend()
      .then(async (backend) => {
        const user = await backend.getCurrentUser()
        if (!active) return
        setState(toState(user))
        unsubscribe = backend.onAuthChange((next) => {
          setState(toState(next))
          // Troca de usuário/logout: nada do cache do painel pode vazar para a próxima sessão.
          if (!next) queryClient.removeQueries({ queryKey: ['admin'] })
        })
      })
      .catch(() => active && setState(toState(null)))

    return () => {
      active = false
      unsubscribe()
    }
  }, [queryClient])

  const signIn = useCallback(async (email: string, password: string) => {
    const backend = await loadAdminBackend()
    const user = await backend.signIn(email, password)
    setState(toState(user))
  }, [])

  const signOut = useCallback(async () => {
    const backend = await loadAdminBackend()
    await backend.signOut()
    queryClient.removeQueries({ queryKey: ['admin'] })
    setState(toState(null))
  }, [queryClient])

  const value = useMemo(
    () => ({ state, mode: getBackendMode(), signIn, signOut }),
    [state, signIn, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
