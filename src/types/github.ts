/** Repositório no formato do domínio (desacoplado do JSON da API). */
export interface GithubRepo {
  id: number
  name: string
  description: string | null
  url: string
  homepage: string | null
  language: string | null
  topics: string[]
  stars: number
  forks: number
  isFork: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
  pushedAt: string
}

/** Bytes de código por linguagem, ex.: { TypeScript: 12034, CSS: 800 } */
export type RepoLanguages = Record<string, number>

export interface LanguageShare {
  language: string
  percent: number
}
