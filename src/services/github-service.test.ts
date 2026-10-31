import { describe, expect, it } from 'vitest'
import { GithubApiError } from '@/lib/github-api-error'
import {
  fetchRepo,
  fetchUserRepos,
  selectPortfolioRepos,
  toLanguageShares,
} from '@/services/github-service'
import { jsonResponse, makeRepoDto, mockFetch } from '@/test/github-fixtures'

describe('fetchUserRepos', () => {
  it('chama o endpoint de repos do usuário e mapeia para o domínio', async () => {
    const fetchMock = mockFetch([
      {
        match: /\/users\/octocat\/repos/,
        respond: () =>
          jsonResponse([
            makeRepoDto({
              name: 'portfolio',
              stargazers_count: 7,
              homepage: '  ',
              pushed_at: null,
            }),
          ]),
      },
    ])

    const [repo] = await fetchUserRepos('octocat')

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('per_page=100&sort=pushed&type=owner')
    expect(repo).toMatchObject({ name: 'portfolio', stars: 7, homepage: null })
    // pushed_at nulo (repo vazio) cai para updated_at
    expect(repo?.pushedAt).toBe(repo?.updatedAt)
  })

  it('transforma 403 com cota zerada em erro de rate-limit com horário de retorno', async () => {
    mockFetch([
      {
        match: /.*/,
        respond: () =>
          jsonResponse(
            { message: 'API rate limit exceeded' },
            {
              status: 403,
              headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1800000000' },
            },
          ),
      },
    ])

    const error = await fetchUserRepos('octocat').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(GithubApiError)
    expect(error).toMatchObject({ kind: 'rate-limit', status: 403 })
    expect((error as GithubApiError).resetAt?.getTime()).toBe(1_800_000_000_000)
  })

  it('transforma 404 em erro not-found', async () => {
    mockFetch([{ match: /.*/, respond: () => jsonResponse({}, { status: 404 }) }])

    await expect(fetchRepo('octocat', 'nao-existe')).rejects.toMatchObject({ kind: 'not-found' })
  })

  it('rejeita resposta fora do contrato esperado', async () => {
    mockFetch([{ match: /.*/, respond: () => jsonResponse([{ id: 'não é número' }]) }])

    await expect(fetchUserRepos('octocat')).rejects.toMatchObject({ kind: 'invalid-response' })
  })

  it('reaproveita o cache via ETag: 304 não consome cota e devolve o dado salvo', async () => {
    const dto = makeRepoDto({ name: 'com-etag' })
    let call = 0
    const fetchMock = mockFetch([
      {
        match: /.*/,
        respond: () =>
          call++ === 0
            ? jsonResponse([dto], { headers: { etag: 'W/"abc"' } })
            : jsonResponse(null, { status: 304 }),
      },
    ])

    await fetchUserRepos('octocat')
    const second = await fetchUserRepos('octocat')

    const secondInit = fetchMock.mock.calls[1] as unknown as [string, RequestInit]
    expect((secondInit[1].headers as Record<string, string>)['If-None-Match']).toBe('W/"abc"')
    expect(second[0]?.name).toBe('com-etag')
  })
})

describe('stale-if-error', () => {
  function primeCacheThen(failure: () => Response | Promise<Response>) {
    let call = 0
    return mockFetch([
      {
        match: /.*/,
        respond: () =>
          (call++ === 0
            ? jsonResponse([makeRepoDto({ name: 'salvo' })], { headers: { etag: 'W/"v1"' } })
            : failure()) as Response,
      },
    ])
  }

  it('com a cota esgotada, devolve os dados salvos em vez do erro', async () => {
    primeCacheThen(() =>
      jsonResponse({}, { status: 403, headers: { 'x-ratelimit-remaining': '0' } }),
    )

    await fetchUserRepos('octocat')
    const second = await fetchUserRepos('octocat')

    expect(second[0]?.name).toBe('salvo')
  })

  it('sem rede, devolve os dados salvos', async () => {
    const fetchMock = primeCacheThen(() => jsonResponse([]))
    await fetchUserRepos('octocat')
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    const second = await fetchUserRepos('octocat')

    expect(second[0]?.name).toBe('salvo')
  })

  it('sem nada salvo, o rate limit continua virando erro tipado', async () => {
    mockFetch([
      {
        match: /.*/,
        respond: () => jsonResponse({}, { status: 403, headers: { 'x-ratelimit-remaining': '0' } }),
      },
    ])

    await expect(fetchUserRepos('octocat')).rejects.toMatchObject({ kind: 'rate-limit' })
  })
})

describe('regras de exibição', () => {
  it('remove forks e arquivados e ordena pelo push mais recente', async () => {
    mockFetch([
      {
        match: /.*/,
        respond: () =>
          jsonResponse([
            makeRepoDto({ name: 'antigo', pushed_at: '2024-01-01T00:00:00Z' }),
            makeRepoDto({ name: 'fork', fork: true }),
            makeRepoDto({ name: 'arquivado', archived: true }),
            makeRepoDto({ name: 'novo', pushed_at: '2026-06-01T00:00:00Z' }),
          ]),
      },
    ])

    const repos = selectPortfolioRepos(await fetchUserRepos('octocat'))

    expect(repos.map((r) => r.name)).toEqual(['novo', 'antigo'])
  })

  it('converte bytes por linguagem em porcentagem', () => {
    expect(toLanguageShares({ CSS: 250, TypeScript: 750 })).toEqual([
      { language: 'TypeScript', percent: 75 },
      { language: 'CSS', percent: 25 },
    ])
    expect(toLanguageShares({})).toEqual([])
  })
})
