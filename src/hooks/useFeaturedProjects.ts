import { useQuery } from '@tanstack/react-query'
import { getPublicBackend } from '@/services/backend'

export const featuredKey = ['featured'] as const

/** Nomes dos repositórios em destaque, na ordem escolhida no painel. */
export function useFeaturedProjects() {
  return useQuery({
    queryKey: featuredKey,
    queryFn: () => getPublicBackend().listFeatured(),
    select: (rows) => [...rows].sort((a, b) => a.position - b.position).map((r) => r.repoName),
  })
}
