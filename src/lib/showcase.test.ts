import { describe, expect, it } from 'vitest'
import {
  filterProjects,
  githubUrlFor,
  listTechnologies,
  mergeWithGithub,
  pickShowcase,
  toSafeExternalUrl,
} from '@/lib/showcase'
import type { GithubRepo } from '@/types/github'
import type { PortfolioProject } from '@/types/portfolio'

function project(overrides: Partial<PortfolioProject>): PortfolioProject {
  return {
    slug: 'p',
    repoName: 'p',
    title: 'Projeto',
    context: 'FIAP',
    summary: 'Resumo',
    description: 'Descrição',
    features: [],
    stack: ['TypeScript'],
    visibility: 'public',
    ...overrides,
  }
}

function repo(name: string): GithubRepo {
  return {
    id: 1,
    name,
    description: null,
    url: `https://github.com/u/${name}`,
    homepage: null,
    language: null,
    topics: [],
    stars: 5,
    forks: 0,
    isFork: false,
    isArchived: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    pushedAt: '2026-01-01T00:00:00Z',
  }
}

const catalog = [
  project({
    slug: 'vinhos',
    repoName: 'Landing-Page',
    title: 'Adega Bordô',
    stack: ['HTML', 'CSS'],
  }),
  project({
    slug: 'gb',
    repoName: 'gb',
    title: 'G&B',
    visibility: 'private',
    features: ['Orçamento pelo WhatsApp'],
    stack: ['React', 'TypeScript'],
  }),
  project({ slug: 'tv', repoName: 'tv', title: 'Novo TV Time', stack: ['React', 'JavaScript'] }),
]

describe('mergeWithGithub', () => {
  it('liga pelo nome do repositório (sem diferenciar maiúsculas), só para públicos', () => {
    const merged = mergeWithGithub(catalog, [repo('landing-page'), repo('gb')])

    expect(merged[0]?.github?.stars).toBe(5)
    expect(merged[1]?.github).toBeNull() // privado nunca recebe dados da API
    expect(merged[2]?.github).toBeNull() // público sem resposta da API
  })
})

describe('githubUrlFor', () => {
  it('usa a URL da API, monta pelo usuário como fallback e omite privados', () => {
    const [vinhos, gb, tv] = mergeWithGithub(catalog, [repo('Landing-Page')])
    expect(vinhos && githubUrlFor(vinhos, 'eu')).toBe('https://github.com/u/Landing-Page')
    expect(tv && githubUrlFor(tv, 'eu')).toBe('https://github.com/eu/tv')
    expect(tv && githubUrlFor(tv, null)).toBeNull()
    expect(gb && githubUrlFor(gb, 'eu')).toBeNull()
  })
})

describe('filterProjects / listTechnologies', () => {
  it('busca em funcionalidades sem acento e combina com tecnologia', () => {
    expect(filterProjects(catalog, { query: 'orcamento', tech: '' }).map((p) => p.slug)).toEqual([
      'gb',
    ])
    expect(filterProjects(catalog, { query: '', tech: 'React' })).toHaveLength(2)
    expect(filterProjects(catalog, { query: 'vinhos', tech: 'React' })).toHaveLength(0)
  })

  it('ordena tecnologias pela frequência', () => {
    expect(listTechnologies(catalog)[0]).toBe('React')
  })
})

describe('pickShowcase', () => {
  it('respeita a ordem dos destaques e ignora slugs que saíram do catálogo', () => {
    expect(pickShowcase(catalog, ['tv', 'removido', 'vinhos']).map((p) => p.slug)).toEqual([
      'tv',
      'vinhos',
    ])
  })

  it('sem destaques válidos, usa os primeiros do catálogo', () => {
    expect(pickShowcase(catalog, [], 2).map((p) => p.slug)).toEqual(['vinhos', 'gb'])
  })
})

describe('toSafeExternalUrl', () => {
  it('aceita http(s), completa domínio sem protocolo e bloqueia javascript:', () => {
    expect(toSafeExternalUrl('site.dev/app')).toBe('https://site.dev/app')
    expect(toSafeExternalUrl('javascript:alert(1)')).toBeNull()
    expect(toSafeExternalUrl(undefined)).toBeNull()
  })
})
