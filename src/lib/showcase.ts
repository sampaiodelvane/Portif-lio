import type { GithubRepo } from '@/types/github'
import type { PortfolioProject, ShowcaseProject } from '@/types/portfolio'

/**
 * Junta o catálogo curado com os dados da API do GitHub.
 * Só repositórios PÚBLICOS recebem dados da API; os privados nem aparecem nela.
 * Sem resposta da API (carregando, erro, cota), o projeto continua na vitrine com github: null.
 */
export function mergeWithGithub(
  projects: PortfolioProject[],
  repos: GithubRepo[],
): ShowcaseProject[] {
  const byName = new Map(repos.map((repo) => [repo.name.toLowerCase(), repo]))
  return projects.map((project) => ({
    ...project,
    github:
      project.visibility === 'public' ? (byName.get(project.repoName.toLowerCase()) ?? null) : null,
  }))
}

/** Link do código: só para públicos. Usa o da API; sem ela, monta a partir do usuário. */
export function githubUrlFor(project: ShowcaseProject, username: string | null): string | null {
  if (project.visibility === 'private') return null
  if (project.github) return project.github.url
  return username ? `https://github.com/${username}/${encodeURIComponent(project.repoName)}` : null
}

export interface ProjectFilters {
  query: string
  tech: string
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

/** Busca em título, resumo, descrição, funcionalidades e stack (sem acento/maiúscula). */
export function filterProjects<T extends PortfolioProject>(
  projects: T[],
  { query, tech }: ProjectFilters,
): T[] {
  const needle = normalize(query.trim())
  return projects.filter((project) => {
    if (tech && !project.stack.includes(tech)) return false
    if (!needle) return true
    const haystack = normalize(
      [
        project.title,
        project.repoName,
        project.summary,
        project.description,
        ...project.features,
        ...project.stack,
      ].join(' '),
    )
    return haystack.includes(needle)
  })
}

/** Tecnologias presentes, da mais usada para a menos usada. */
export function listTechnologies(projects: PortfolioProject[]): string[] {
  const counts = new Map<string, number>()
  for (const project of projects) {
    for (const tech of project.stack) counts.set(tech, (counts.get(tech) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tech]) => tech)
}

/** Destaques escolhidos no painel (por slug, na ordem); sem escolha válida, os primeiros. */
export function pickShowcase<T extends PortfolioProject>(
  projects: T[],
  featuredSlugs: string[],
  count = 3,
): T[] {
  const bySlug = new Map(projects.map((project) => [project.slug, project]))
  const chosen = featuredSlugs
    .map((slug) => bySlug.get(slug))
    .filter((project): project is T => project !== undefined)
  return (chosen.length > 0 ? chosen : projects).slice(0, count)
}

/** Só aceita http(s); completa "site.com" com https://. Evita href javascript:. */
export function toSafeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const candidate = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`
  try {
    const url = new URL(candidate)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch {
    return null
  }
}
