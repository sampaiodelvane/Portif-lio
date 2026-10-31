import { QueryClient } from '@tanstack/react-query'
import { GithubApiError } from '@/lib/github-api-error'

const MINUTE = 60_000

/** Erros que não adianta repetir: só gastariam cota da API. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof GithubApiError) {
    if (error.kind === 'rate-limit' || error.kind === 'not-found') return false
    if (error.kind === 'invalid-response') return false
  }
  return failureCount < 2
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Repositórios mudam pouco: 10 min "frescos" evitam refetch a cada navegação.
        // API sem token = 60 req/h por IP, então economizar requisição importa.
        staleTime: 10 * MINUTE,
        gcTime: 60 * MINUTE,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      },
    },
  })
}
