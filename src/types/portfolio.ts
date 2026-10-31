import type { GithubRepo } from '@/types/github'

/** Projeto da vitrine, com conteúdo escrito à mão (curadoria). */
export interface PortfolioProject {
  /** Usado na URL canônica: /projetos/:slug */
  slug: string
  /** Nome real do repositório no GitHub (pode ser diferente do título exibido). */
  repoName: string
  title: string
  /** Contexto curto: disciplina, cliente, tipo de trabalho. */
  context: string
  /** Uma frase para o card. */
  summary: string
  /** Parágrafo da página de detalhe. */
  description: string
  features: string[]
  /** Tecnologias, a principal primeiro. */
  stack: string[]
  /** Privado: a API pública do GitHub não o enxerga, então tudo vem do catálogo. */
  visibility: 'public' | 'private'
  /** Sistema publicado (pode exigir login). */
  liveUrl?: string
  /** Demonstração pública com dados fictícios: o link mais útil para quem visita o portfólio. */
  demoUrl?: string
  /** Texto provisório, ainda não revisado pelo autor. */
  draft?: boolean
}

/** Projeto do catálogo + dados do GitHub quando o repositório é público e a API respondeu. */
export interface ShowcaseProject extends PortfolioProject {
  github: GithubRepo | null
}
