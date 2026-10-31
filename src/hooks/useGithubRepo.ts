import { useQuery, useQueryClient } from '@tanstack/react-query'
import { githubKeys } from '@/hooks/github-query-keys'
import { getGithubUsername } from '@/lib/env'
import { fetchRepo, fetchRepoLanguages, toLanguageShares } from '@/services/github-service'
import type { GithubRepo } from '@/types/github'

/**
 * Detalhe de um repositório. Se o usuário veio da lista, o card já está no cache
 * de ['github', user, 'repos'] e a página abre instantaneamente (initialData),
 * sem gastar outra requisição enquanto o dado estiver fresco.
 */
export function useGithubRepo(repoName: string) {
  const username = getGithubUsername()
  const queryClient = useQueryClient()
  const reposKey = githubKeys.repos(username ?? '')

  const query = useQuery({
    queryKey: githubKeys.repo(username ?? '', repoName),
    queryFn: ({ signal }) => fetchRepo(username as string, repoName, signal),
    enabled: username !== null && repoName !== '',
    initialData: () =>
      queryClient
        .getQueryData<GithubRepo[]>(reposKey)
        ?.find((repo) => repo.name.toLowerCase() === repoName.toLowerCase()),
    initialDataUpdatedAt: () => queryClient.getQueryState(reposKey)?.dataUpdatedAt,
  })

  return { ...query, username }
}

export function useRepoLanguages(repoName: string) {
  const username = getGithubUsername()

  return useQuery({
    queryKey: githubKeys.languages(username ?? '', repoName),
    queryFn: ({ signal }) => fetchRepoLanguages(username as string, repoName, signal),
    select: toLanguageShares,
    enabled: username !== null && repoName !== '',
  })
}
