/**
 * Erro tipado da API do GitHub. A UI decide a mensagem pelo `kind`, não pelo texto.
 * Fica em lib/ (e não em services/) porque componentes e o QueryClient também o usam.
 * - rate-limit: cota de 60 req/h por IP esgotada (API sem token)
 * - not-found: usuário ou repositório inexistente/privado
 */
export class GithubApiError extends Error {
  readonly kind: 'rate-limit' | 'not-found' | 'invalid-response' | 'network' | 'http'
  readonly status: number | null
  /** Quando a cota volta (só para rate-limit). */
  readonly resetAt: Date | null

  constructor(
    kind: GithubApiError['kind'],
    message: string,
    options: { status?: number | null; resetAt?: Date | null; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause })
    this.name = 'GithubApiError'
    this.kind = kind
    this.status = options.status ?? null
    this.resetAt = options.resetAt ?? null
  }
}
