import { SearchX } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { PageHeading } from '@/components/PageHeading'
import { ProjectFilters } from '@/components/projects/ProjectFilters'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { usePortfolioProjects } from '@/hooks/usePortfolioProjects'
import { filterProjects, listTechnologies } from '@/lib/showcase'

export default function ProjectsPage() {
  const { projects, isGithubLoading } = usePortfolioProjects()
  // Filtros na URL: links compartilháveis e o "voltar" do navegador restaura a busca.
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const tech = searchParams.get('tech') ?? ''

  const technologies = useMemo(() => listTechnologies(projects), [projects])
  const visible = useMemo(() => filterProjects(projects, { query, tech }), [projects, query, tech])

  function updateParam(key: 'q' | 'tech', value: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set(key, value)
        else next.delete(key)
        return next
      },
      { replace: true },
    )
  }

  return (
    <>
      <title>Projetos · Portfólio</title>
      <PageHeading eyebrow="Trabalhos selecionados" title="Projetos">
        Projetos acadêmicos e profissionais, com o contexto, as funcionalidades e as tecnologias de
        cada um.
      </PageHeading>

      <div className="flex flex-col gap-6">
        <ProjectFilters
          query={query}
          tech={tech}
          technologies={technologies}
          onQueryChange={(value) => updateParam('q', value)}
          onTechChange={(value) => updateParam('tech', value)}
        />
        <p aria-live="polite" className="font-mono text-xs text-muted">
          {visible.length} de {projects.length} projetos
        </p>
        {visible.length > 0 ? (
          // h2: os cards ficam logo abaixo do h1 da página (hierarquia de títulos sem saltos).
          <ProjectGrid projects={visible} headingLevel="h2" githubLoading={isGithubLoading} />
        ) : (
          <StatusMessage
            icon={SearchX}
            title="Nenhum projeto encontrado"
            action={
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                className="rounded-md border border-line px-4 py-2 text-sm hover:bg-surface"
              >
                Limpar filtros
              </button>
            }
          >
            Nenhum projeto corresponde aos filtros atuais.
          </StatusMessage>
        )}
      </div>
    </>
  )
}
