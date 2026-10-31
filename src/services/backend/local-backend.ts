import { BackendError, DEMO_CREDENTIALS } from '@/lib/backend-error'
import type { AdminBackend, PublicBackend } from '@/services/backend/backend-types'
import type { AuthUser } from '@/types/auth'
import type { ContactMessage, FeaturedProject } from '@/types/contact'

/**
 * Backend de DEMONSTRAÇÃO: tudo fica no localStorage do próprio visitante.
 * Não é segurança real (a senha está no bundle) e não precisa ser: cada pessoa só
 * enxerga os dados do próprio navegador. Em produção com dados reais, use Supabase.
 */

const KEYS = {
  messages: 'portfolio-demo:messages',
  featured: 'portfolio-demo:featured',
  session: 'portfolio-demo:session',
}

const SESSION_TTL_MS = 8 * 60 * 60 * 1000
const DEMO_USER: AuthUser = { id: 'demo-user', email: DEMO_CREDENTIALS.email }

interface StoredSession {
  user: AuthUser
  expiresAt: number
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new BackendError('request-failed', 'Armazenamento local indisponível')
  }
}

// Latência simulada para os estados de loading aparecerem na demo (zero nos testes).
const LATENCY_MS = import.meta.env.MODE === 'test' ? 0 : 350
const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

function currentSession(): StoredSession | null {
  const session = read<StoredSession | null>(KEYS.session, null)
  if (!session || session.expiresAt <= Date.now()) return null
  return session
}

function requireSession(): void {
  if (!currentSession()) throw new BackendError('unauthorized', 'Sessão expirada')
}

const listeners = new Set<(user: AuthUser | null) => void>()
const notify = (user: AuthUser | null) => {
  for (const listener of listeners) listener(user)
}

export const localPublicBackend: PublicBackend = {
  async createMessage(input) {
    await delay()
    const messages = read<ContactMessage[]>(KEYS.messages, [])
    const message: ContactMessage = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      readAt: null,
    }
    write(KEYS.messages, [message, ...messages])
  },

  async listFeatured() {
    return read<FeaturedProject[]>(KEYS.featured, [])
  },
}

export const localAdminBackend: AdminBackend = {
  async getCurrentUser() {
    return currentSession()?.user ?? null
  },

  onAuthChange(callback) {
    listeners.add(callback)
    return () => listeners.delete(callback)
  },

  async signIn(email, password) {
    await delay()
    const valid =
      email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
      password === DEMO_CREDENTIALS.password
    if (!valid) throw new BackendError('invalid-credentials', 'E-mail ou senha inválidos')
    write(KEYS.session, { user: DEMO_USER, expiresAt: Date.now() + SESSION_TTL_MS })
    notify(DEMO_USER)
    return DEMO_USER
  },

  async signOut() {
    try {
      localStorage.removeItem(KEYS.session)
    } finally {
      notify(null)
    }
  },

  async listMessages() {
    requireSession()
    await delay()
    return read<ContactMessage[]>(KEYS.messages, [])
  },

  async setMessageRead(id, isRead) {
    requireSession()
    const messages = read<ContactMessage[]>(KEYS.messages, [])
    write(
      KEYS.messages,
      messages.map((m) =>
        m.id === id ? { ...m, readAt: isRead ? new Date().toISOString() : null } : m,
      ),
    )
  },

  async deleteMessage(id) {
    requireSession()
    const messages = read<ContactMessage[]>(KEYS.messages, [])
    write(
      KEYS.messages,
      messages.filter((m) => m.id !== id),
    )
  },

  async setFeatured(slugs) {
    requireSession()
    await delay()
    write(
      KEYS.featured,
      slugs.map((slug, position) => ({ slug, position })),
    )
  },
}
