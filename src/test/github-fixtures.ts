import { vi } from 'vitest'

let nextId = 1

/** JSON no formato da API do GitHub (snake_case), só com os campos que usamos. */
export function makeRepoDto(overrides: Record<string, unknown> = {}) {
  const id = nextId++
  return {
    id,
    name: `repo-${id}`,
    description: `Descrição do repo ${id}`,
    html_url: `https://github.com/octocat/repo-${id}`,
    homepage: null,
    language: 'TypeScript',
    topics: [],
    stargazers_count: 0,
    forks_count: 0,
    fork: false,
    archived: false,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    pushed_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

export function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
): Response {
  const status = init.status ?? 200
  // 304 não pode ter corpo (o construtor de Response lança erro).
  return new Response(status === 304 ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })
}

type Route = { match: RegExp; respond: () => Response }

/** Substitui o fetch global; cada URL é respondida pela primeira rota cujo regex casar. */
export function mockFetch(routes: Route[]) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    const route = routes.find((r) => r.match.test(url))
    if (!route) throw new Error(`Sem resposta mockada para ${url}`)
    return route.respond()
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}
