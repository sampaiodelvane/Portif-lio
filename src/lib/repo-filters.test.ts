import { describe, expect, it } from 'vitest'
import { filterRepos, listLanguages, toSafeExternalUrl } from '@/lib/repo-filters'
import type { GithubRepo } from '@/types/github'

function repo(overrides: Partial<GithubRepo>): GithubRepo {
  return {
    id: Math.random(),
    name: 'repo',
    description: null,
    url: 'https://github.com/x/repo',
    homepage: null,
    language: null,
    topics: [],
    stars: 0,
    forks: 0,
    isFork: false,
    isArchived: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    pushedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const repos = [
  repo({ name: 'loja-virtual', description: 'E-commerce de demonstração', language: 'JavaScript' }),
  repo({ name: 'iot-esp32', topics: ['mqtt', 'hivemq'], language: 'C++' }),
  repo({ name: 'portfolio', description: 'Portfólio em React', language: 'TypeScript' }),
  repo({ name: 'api', language: 'TypeScript' }),
]

describe('filterRepos', () => {
  it('busca em nome, descrição e tópicos, ignorando acento e maiúsculas', () => {
    expect(filterRepos(repos, { query: 'PORTFOLIO', language: '' }).map((r) => r.name)).toEqual([
      'portfolio',
    ])
    expect(filterRepos(repos, { query: 'demonstracao', language: '' })).toHaveLength(1)
    expect(filterRepos(repos, { query: 'mqtt', language: '' })[0]?.name).toBe('iot-esp32')
  })

  it('combina busca e linguagem', () => {
    expect(filterRepos(repos, { query: '', language: 'TypeScript' })).toHaveLength(2)
    expect(filterRepos(repos, { query: 'api', language: 'TypeScript' })).toHaveLength(1)
    expect(filterRepos(repos, { query: 'api', language: 'C++' })).toHaveLength(0)
  })
})

describe('listLanguages', () => {
  it('ordena pela quantidade de repositórios', () => {
    expect(listLanguages(repos)).toEqual(['TypeScript', 'C++', 'JavaScript'])
  })
})

describe('toSafeExternalUrl', () => {
  it('aceita http(s) e completa domínio sem protocolo', () => {
    expect(toSafeExternalUrl('https://site.dev')).toBe('https://site.dev/')
    expect(toSafeExternalUrl('site.dev/app')).toBe('https://site.dev/app')
  })

  it('bloqueia protocolos perigosos e valores vazios', () => {
    expect(toSafeExternalUrl('javascript:alert(1)')).toBeNull()
    expect(toSafeExternalUrl('')).toBeNull()
    expect(toSafeExternalUrl(null)).toBeNull()
  })
})
