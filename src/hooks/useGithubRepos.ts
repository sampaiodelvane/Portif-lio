import { useQuery } from '@tanstack/react-query'
import { githubKeys } from '@/hooks/github-query-keys'
import { getGithubUsername } from '@/lib/env'
import { fetchUserRepos, selectPortfolioRepos } from '@/services/github-service'

/** Repositórios do portfólio (sem forks/arquivados). `username` null = env não configurado. */
export function useGithubRepos() {
  const username = getGithubUsername()

  const query = useQuery({
    queryKey: githubKeys.repos(username ?? ''),
    queryFn: ({ signal }) => fetchUserRepos(username as string, signal),
    select: selectPortfolioRepos,
    enabled: username !== null,
  })

  return { ...query, username }
}
