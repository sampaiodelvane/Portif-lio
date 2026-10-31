import { useQuery } from '@tanstack/react-query'
import { githubKeys } from '@/hooks/github-query-keys'
import { getGithubUsername } from '@/lib/env'
import { fetchRepoLanguages, toLanguageShares } from '@/services/github-service'

/** Porcentagem de cada linguagem do repositório (só para repositórios públicos). */
export function useRepoLanguages(repoName: string, enabled = true) {
  const username = getGithubUsername()

  return useQuery({
    queryKey: githubKeys.languages(username ?? '', repoName),
    queryFn: ({ signal }) => fetchRepoLanguages(username as string, repoName, signal),
    select: toLanguageShares,
    enabled: enabled && username !== null && repoName !== '',
  })
}
