import { createClient, type User } from '@supabase/supabase-js'
import { BackendError } from '@/lib/backend-error'
import type { SupabaseConfig } from '@/lib/env'
import type { AdminBackend } from '@/services/backend/backend-types'
import type { AuthUser } from '@/types/auth'
import type { ContactMessage } from '@/types/contact'

// Este módulo só é baixado em /login e /admin (import dinâmico em backend/index.ts).

interface MessageRow {
  id: string
  name: string
  email: string
  subject: string
  message: string
  created_at: string
  read_at: string | null
}

const toUser = (user: User | null | undefined): AuthUser | null =>
  user ? { id: user.id, email: user.email ?? '' } : null

const toMessage = (row: MessageRow): ContactMessage => ({
  id: row.id,
  name: row.name,
  email: row.email,
  subject: row.subject,
  message: row.message,
  createdAt: row.created_at,
  readAt: row.read_at,
})

function fail(error: { message: string; code?: string } | null): void {
  if (!error) return
  // 42501 = permissão negada pelo RLS (usuário logado mas fora de admin_users)
  const kind = error.code === '42501' ? 'unauthorized' : 'request-failed'
  throw new BackendError(kind, error.message, { cause: error })
}

export function createSupabaseAdminBackend({ url, anonKey }: SupabaseConfig): AdminBackend {
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  })

  return {
    async getCurrentUser() {
      const { data } = await supabase.auth.getSession()
      return toUser(data.session?.user)
    },

    onAuthChange(callback) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) =>
        callback(toUser(session?.user)),
      )
      return () => data.subscription.unsubscribe()
    },

    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        throw new BackendError('invalid-credentials', 'E-mail ou senha inválidos', { cause: error })
      }
      const user = toUser(data.user)
      if (!user) throw new BackendError('invalid-credentials', 'E-mail ou senha inválidos')
      return user
    },

    async signOut() {
      await supabase.auth.signOut()
    },

    async listMessages() {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('id, name, email, subject, message, created_at, read_at')
        .order('created_at', { ascending: false })
      fail(error)
      return ((data ?? []) as MessageRow[]).map(toMessage)
    },

    async setMessageRead(id, read) {
      const { error } = await supabase
        .from('contact_messages')
        .update({ read_at: read ? new Date().toISOString() : null })
        .eq('id', id)
      fail(error)
    },

    async deleteMessage(id) {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id)
      fail(error)
    },

    async setFeatured(slugs) {
      // Função SQL: troca a lista numa única transação (ver supabase/migrations).
      const { error } = await supabase.rpc('set_featured_projects', { slugs })
      fail(error)
    },
  }
}
