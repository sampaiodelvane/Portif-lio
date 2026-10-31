import type { z } from 'zod'
import { GithubApiError } from '@/lib/github-api-error'

const GITHUB_API = 'https://api.github.com'
const ETAG_CACHE_PREFIX = 'gh-etag:'

interface CachedEntry {
  etag: string
  body: unknown
}

// Requisições condicionais (If-None-Match): resposta 304 NÃO consome a cota da API.
// O TanStack Query cuida do cache em memória; este cache em localStorage
// sobrevive a recarregamentos e evita gastar cota com dados que não mudaram.
function readCache(url: string): CachedEntry | null {
  try {
    const raw = localStorage.getItem(ETAG_CACHE_PREFIX + url)
    return raw ? (JSON.parse(raw) as CachedEntry) : null
  } catch {
    return null
  }
}

function writeCache(url: string, entry: CachedEntry): void {
  try {
    localStorage.setItem(ETAG_CACHE_PREFIX + url, JSON.stringify(entry))
  } catch {
    // Cota do localStorage cheia ou indisponível: segue só com o cache em memória.
  }
}

function parseResetHeader(response: Response): Date | null {
  const reset = Number(response.headers.get('x-ratelimit-reset'))
  return Number.isFinite(reset) && reset > 0 ? new Date(reset * 1000) : null
}

function isRateLimited(response: Response): boolean {
  if (response.status === 429) return true
  return response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0'
}

export async function githubFetch<T>(
  path: string,
  schema: z.ZodType<T>,
  init: { signal?: AbortSignal } = {},
): Promise<T> {
  const url = `${GITHUB_API}${path}`
  const cached = readCache(url)

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (cached) headers['If-None-Match'] = cached.etag

  let response: Response
  try {
    response = await fetch(url, { headers, signal: init.signal })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new GithubApiError('network', 'Falha de rede ao acessar o GitHub', { cause: error })
  }

  let body: unknown
  if (response.status === 304 && cached) {
    body = cached.body
  } else if (response.ok) {
    body = await response.json()
    const etag = response.headers.get('etag')
    if (etag) writeCache(url, { etag, body })
  } else if (isRateLimited(response)) {
    throw new GithubApiError('rate-limit', 'Limite de requisições do GitHub atingido', {
      status: response.status,
      resetAt: parseResetHeader(response),
    })
  } else if (response.status === 404) {
    throw new GithubApiError('not-found', 'Recurso não encontrado no GitHub', { status: 404 })
  } else {
    throw new GithubApiError('http', `GitHub respondeu ${response.status}`, {
      status: response.status,
    })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw new GithubApiError('invalid-response', 'Resposta inesperada da API do GitHub', {
      cause: parsed.error,
    })
  }
  return parsed.data
}
