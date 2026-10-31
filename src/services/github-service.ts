import { z } from 'zod'
import { githubFetch } from '@/services/github-client'
import type { GithubRepo, LanguageShare, RepoLanguages } from '@/types/github'

// Validamos só os campos usados; o resto do JSON da API é ignorado.
const repoSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  html_url: z.url(),
  homepage: z.string().nullable().optional(),
  language: z.string().nullable(),
  topics: z.array(z.string()).optional().default([]),
  stargazers_count: z.number(),
  forks_count: z.number(),
  fork: z.boolean(),
  archived: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  pushed_at: z.string().nullable(),
})

type RepoDto = z.infer<typeof repoSchema>

function toGithubRepo(dto: RepoDto): GithubRepo {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    url: dto.html_url,
    homepage: dto.homepage?.trim() ? dto.homepage.trim() : null,
    language: dto.language,
    topics: dto.topics,
    stars: dto.stargazers_count,
    forks: dto.forks_count,
    isFork: dto.fork,
    isArchived: dto.archived,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    pushedAt: dto.pushed_at ?? dto.updated_at,
  }
}

const enc = encodeURIComponent

/** Repositórios públicos do usuário (até 100, mais recentes primeiro). */
export async function fetchUserRepos(
  username: string,
  signal?: AbortSignal,
): Promise<GithubRepo[]> {
  const dtos = await githubFetch(
    `/users/${enc(username)}/repos?per_page=100&sort=pushed&type=owner`,
    z.array(repoSchema),
    { signal },
  )
  return dtos.map(toGithubRepo)
}

export async function fetchRepo(
  username: string,
  repoName: string,
  signal?: AbortSignal,
): Promise<GithubRepo> {
  const dto = await githubFetch(`/repos/${enc(username)}/${enc(repoName)}`, repoSchema, {
    signal,
  })
  return toGithubRepo(dto)
}

export async function fetchRepoLanguages(
  username: string,
  repoName: string,
  signal?: AbortSignal,
): Promise<RepoLanguages> {
  return githubFetch(
    `/repos/${enc(username)}/${enc(repoName)}/languages`,
    z.record(z.string(), z.number()),
    { signal },
  )
}

/** Converte bytes por linguagem em porcentagens (maiores primeiro, 1 casa decimal). */
export function toLanguageShares(languages: RepoLanguages): LanguageShare[] {
  const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0)
  if (total === 0) return []
  return Object.entries(languages)
    .map(([language, bytes]) => ({ language, percent: Math.round((bytes / total) * 1000) / 10 }))
    .sort((a, b) => b.percent - a.percent)
}

/** Lista exibida no portfólio: sem forks e arquivados, mais recentes primeiro. */
export function selectPortfolioRepos(repos: GithubRepo[]): GithubRepo[] {
  return repos
    .filter((repo) => !repo.isFork && !repo.isArchived)
    .sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt))
}
