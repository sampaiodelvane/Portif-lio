import type { ContactMessage } from '@/types/contact'

// Mesmas chaves de src/services/backend/local-backend.ts
export const DEMO_KEYS = {
  messages: 'portfolio-demo:messages',
  featured: 'portfolio-demo:featured',
  session: 'portfolio-demo:session',
}

export function seedDemoSession({ expired = false } = {}) {
  localStorage.setItem(
    DEMO_KEYS.session,
    JSON.stringify({
      user: { id: 'demo-user', email: 'demo@portfolio.local' },
      expiresAt: expired ? Date.now() - 1000 : Date.now() + 60 * 60 * 1000,
    }),
  )
}

export function seedMessages(messages: Partial<ContactMessage>[]) {
  const full = messages.map((m, index) => ({
    id: `msg-${index}`,
    name: 'Ana',
    email: 'ana@exemplo.com',
    subject: 'Assunto',
    message: 'Mensagem de teste com tamanho suficiente.',
    createdAt: '2026-10-01T12:00:00Z',
    readAt: null,
    ...m,
  }))
  localStorage.setItem(DEMO_KEYS.messages, JSON.stringify(full))
}

export function readStored<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  return raw ? (JSON.parse(raw) as T) : null
}
