import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { PageHeading } from '@/components/PageHeading'
import { ROUTE_PATHS } from '@/routes/route-paths'

// Fase 3: detalhes do repositório (README, linguagens, links) vindos da API do GitHub.
export default function ProjectDetailPage() {
  const { repoName = '' } = useParams()

  return (
    <>
      <title>{`${repoName} · Portfólio`}</title>
      <Link
        to={ROUTE_PATHS.projects}
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Todos os projetos
      </Link>
      <PageHeading eyebrow="Projeto" title={repoName}>
        Os detalhes deste repositório serão carregados do GitHub na próxima fase.
      </PageHeading>
    </>
  )
}
