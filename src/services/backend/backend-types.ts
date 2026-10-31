import type { AuthUser } from '@/types/auth'
import type { ContactInput, ContactMessage, FeaturedProject } from '@/types/contact'

/**
 * Operações públicas (visitante anônimo). Precisam ser leves: rodam na home e no contato.
 * Na implementação Supabase usam fetch direto na API REST (sem carregar o supabase-js).
 */
export interface PublicBackend {
  createMessage: (input: ContactInput) => Promise<void>
  listFeatured: () => Promise<FeaturedProject[]>
}

/** Operações do painel. Carregadas sob demanda (import dinâmico) só em /login e /admin. */
export interface AdminBackend {
  getCurrentUser: () => Promise<AuthUser | null>
  onAuthChange: (callback: (user: AuthUser | null) => void) => () => void
  signIn: (email: string, password: string) => Promise<AuthUser>
  signOut: () => Promise<void>
  listMessages: () => Promise<ContactMessage[]>
  setMessageRead: (id: string, read: boolean) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  /** Substitui a lista inteira (ordem do array = posição). */
  setFeatured: (repoNames: string[]) => Promise<void>
}
