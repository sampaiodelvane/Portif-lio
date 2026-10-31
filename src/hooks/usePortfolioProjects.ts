import { useMemo } from 'react'
import { PORTFOLIO_PROJECTS } from '@/content/projects'
import { useGithubRepos } from '@/hooks/useGithubRepos'
import { mergeWithGithub } from '@/lib/showcase'

/**
 * Vitrine = catálogo curado (sempre disponível, sem rede) + dados do GitHub (complemento).
 * A lista nunca depende da API: se ela falhar ou a cota acabar, só somem estrelas e datas.
 */
export function usePortfolioProjects() {
  const github = useGithubRepos()

  const projects = useMemo(
    () => mergeWithGithub(PORTFOLIO_PROJECTS, github.data ?? []),
    [github.data],
  )

  return {
    projects,
    username: github.username,
    /** true enquanto os dados complementares do GitHub ainda estão chegando. */
    isGithubLoading: github.username !== null && github.isPending,
  }
}
