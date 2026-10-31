import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { ProjectGrid, ProjectGridSkeleton } from '@/components/projects/ProjectGrid'
import { useFeaturedProjects } from '@/hooks/useFeaturedProjects'
import { useGithubRepos } from '@/hooks/useGithubRepos'
import { ROUTE_PATHS } from '@/routes/route-paths'
import type { GithubRepo } from '@/types/github'

const COUNT = 3

/** Destaques escolhidos no painel; se não houver, os mais recentes. */
function pickShowcase(repos: GithubRepo[], featured: string[]): GithubRepo[] {
  const byName = new Map(repos.map((repo) => [repo.name, repo]))
  const chosen = featured
    .map((name) => byName.get(name))
    .filter((repo): repo is GithubRepo => repo !== undefined)
  return chosen.length > 0 ? chosen.slice(0, COUNT) : repos.slice(0, COUNT)
}

/** Vitrine da home. Usa o mesmo cache da página de projetos (uma requisição para as duas). */
export function RecentProjects() {
  const { data: repos, isPending, isError, username } = useGithubRepos()
  // Falha ao ler destaques não pode esconder a vitrine: cai para "recentes".
  const featured = useFeaturedProjects()
  const featuredNames = featured.data ?? []
  const loading = isPending || featured.isPending

  // Na home, falha ou falta de configuração não deve dominar a página: a seção some.
  if (username === null || isError) return null
  if (!isPending && repos.length === 0) return null

  const hasFeatured = !loading && featuredNames.some((name) => repos?.some((r) => r.name === name))

  return (
    <section aria-labelledby="vitrine" className="flex flex-col gap-6 border-t border-line pt-12">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="vitrine" className="font-serif text-3xl">
          {hasFeatured ? 'Projetos em destaque' : 'Projetos recentes'}
        </h2>
        <Link
          to={ROUTE_PATHS.projects}
          className="inline-flex shrink-0 items-center gap-1 text-sm text-muted hover:text-ink"
        >
          Ver todos
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      {loading && !featured.isError ? (
        <ProjectGridSkeleton count={COUNT} />
      ) : (
        <ProjectGrid repos={pickShowcase(repos ?? [], featuredNames)} />
      )}
    </section>
  )
}
