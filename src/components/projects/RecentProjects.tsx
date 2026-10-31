import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { useFeaturedProjects } from '@/hooks/useFeaturedProjects'
import { usePortfolioProjects } from '@/hooks/usePortfolioProjects'
import { pickShowcase } from '@/lib/showcase'
import { preloadOnIntent } from '@/routes/page-loaders'
import { ROUTE_PATHS } from '@/routes/route-paths'

/**
 * Vitrine da home: destaques escolhidos no painel; sem escolha, os primeiros do catálogo.
 * O catálogo é local, então a seção aparece mesmo sem a API do GitHub.
 */
export function RecentProjects() {
  const { projects, isGithubLoading } = usePortfolioProjects()
  // Falha ao ler destaques não pode esconder a vitrine: cai para a ordem do catálogo.
  const featured = useFeaturedProjects()

  return (
    <section aria-labelledby="vitrine" className="flex flex-col gap-6 border-t border-line pt-12">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="vitrine" className="font-serif text-3xl">
          Projetos em destaque
        </h2>
        <Link
          to={ROUTE_PATHS.projects}
          {...preloadOnIntent('projects')}
          className="inline-flex shrink-0 items-center gap-1 text-sm text-muted hover:text-ink"
        >
          Ver todos
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <ProjectGrid
        projects={pickShowcase(projects, featured.data ?? [])}
        githubLoading={isGithubLoading}
      />
    </section>
  )
}
