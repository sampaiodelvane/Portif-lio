import { ArrowRight } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { Link } from 'react-router'
import { ProjectGridSkeleton } from '@/components/projects/ProjectGrid'
import { Skeleton } from '@/components/ui/Skeleton'
import { ROUTE_PATHS } from '@/routes/route-paths'

// A vitrine fica abaixo da dobra e puxa Zod + serviço do GitHub: carrega depois do hero.
const RecentProjects = lazy(() =>
  import('@/components/projects/RecentProjects').then((m) => ({ default: m.RecentProjects })),
)

/**
 * Página de entrada: é a ÚNICA página fora do code-splitting (import estático em app-routes).
 * O <h1> é o elemento de LCP; se a página fosse lazy, o navegador só descobriria o chunk
 * dela depois de executar o JS principal (uma ida e volta extra na rede móvel).
 */
export default function HomePage() {
  return (
    <>
      <title>Portfólio · Desenvolvimento web</title>
      <section className="flex flex-col gap-6 py-8 sm:py-16">
        <p className="font-mono text-sm uppercase tracking-widest text-muted">
          Desenvolvimento web
        </p>
        <h1 className="max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">
          Projetos, código e as decisões por trás deles.
        </h1>
        <p className="max-w-prose text-lg text-muted">
          Uma seleção de repositórios públicos, com contexto sobre stack, trade-offs e o que cada
          projeto ensinou.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to={ROUTE_PATHS.projects}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-paper transition-opacity hover:opacity-90"
          >
            Ver projetos
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            to={ROUTE_PATHS.contact}
            className="inline-flex items-center rounded-md border border-line px-5 py-3 transition-colors hover:bg-surface"
          >
            Entrar em contato
          </Link>
        </div>
      </section>
      <Suspense fallback={<ShowcaseSkeleton />}>
        <RecentProjects />
      </Suspense>
    </>
  )
}

/** Mesmo formato da vitrine (título + 3 cards) para o conteúdo não "pular" ao chegar. */
function ShowcaseSkeleton() {
  return (
    <div className="flex flex-col gap-6 border-t border-line pt-12">
      <Skeleton className="h-9 w-64" />
      <ProjectGridSkeleton count={3} />
    </div>
  )
}
