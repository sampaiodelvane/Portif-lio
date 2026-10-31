import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { ProjectGrid, ProjectGridSkeleton } from '@/components/projects/ProjectGrid'
import { useGithubRepos } from '@/hooks/useGithubRepos'
import { ROUTE_PATHS } from '@/routes/route-paths'

const COUNT = 3

/** Vitrine da home. Usa o mesmo cache da página de projetos (uma requisição para as duas). */
export function RecentProjects() {
  const { data: repos, isPending, isError, username } = useGithubRepos()

  // Na home, falha ou falta de configuração não deve dominar a página: a seção some.
  if (username === null || isError) return null
  if (!isPending && repos.length === 0) return null

  return (
    <section aria-labelledby="recentes" className="flex flex-col gap-6 border-t border-line pt-12">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="recentes" className="font-serif text-3xl">
          Projetos recentes
        </h2>
        <Link
          to={ROUTE_PATHS.projects}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          Ver todos
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      {isPending ? (
        <ProjectGridSkeleton count={COUNT} />
      ) : (
        <ProjectGrid repos={repos.slice(0, COUNT)} />
      )}
    </section>
  )
}
