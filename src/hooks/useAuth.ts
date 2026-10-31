import { use } from 'react'
import { AuthContext } from '@/context/auth-context'
import type { AuthContextValue } from '@/types/auth'

export function useAuth(): AuthContextValue {
  const context = use(AuthContext)
  if (!context) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  }
  return context
}
