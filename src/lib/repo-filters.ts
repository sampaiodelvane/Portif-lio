import type { GithubRepo } from '@/types/github'

export interface RepoFilters {
  query: string
  language: string
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/** Busca por nome, descrição e tópicos (sem diferenciar acento/maiúscula) + filtro de linguagem. */
export function filterRepos(repos: GithubRepo[], { query, language }: RepoFilters): GithubRepo[] {
  const needle = normalize(query.trim())
  return repos.filter((repo) => {
    if (language && repo.language !== language) return false
    if (!needle) return true
    const haystack = normalize([repo.name, repo.description ?? '', ...repo.topics].join(' '))
    return haystack.includes(needle)
  })
}

/** Linguagens presentes, da mais usada para a menos usada. */
export function listLanguages(repos: GithubRepo[]): string[] {
  const counts = new Map<string, number>()
  for (const repo of repos) {
    if (repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([language]) => language)
}

/** Só aceita http(s); completa "site.com" com https://. Evita href javascript: vindo da API. */
export function toSafeExternalUrl(value: string | null): string | null {
  if (!value) return null
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`
  try {
    const url = new URL(candidate)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}
