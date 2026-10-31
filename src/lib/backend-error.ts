/** Erro tipado do backend (Supabase ou demo). Em lib/ porque páginas também o inspecionam. */
export class BackendError extends Error {
  readonly kind: 'invalid-credentials' | 'unauthorized' | 'request-failed'

  constructor(kind: BackendError['kind'], message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'BackendError'
    this.kind = kind
  }
}

/**
 * Credenciais do MODO DEMONSTRAÇÃO (sem Supabase configurado).
 * São públicas de propósito: os dados da demo vivem só no localStorage de quem acessa.
 */
export const DEMO_CREDENTIALS = { email: 'demo@portfolio.local', password: 'demo1234' } as const
