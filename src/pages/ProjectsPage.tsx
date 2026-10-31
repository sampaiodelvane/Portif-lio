import { FolderOpen, SearchX } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { PageHeading } from '@/components/PageHeading'
import { GithubErrorMessage } from '@/components/projects/GithubErrorMessage'
import { MissingUsernameMessage } from '@/components/projects/MissingUsernameMessage'
import { ProjectFilters } from '@/components/projects/ProjectFilters'
import { ProjectGrid, ProjectGridSkeleton } from '@/components/projects/ProjectGrid'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { useGithubRepos } from '@/hooks/useGithubRepos'
import { filterRepos, listLanguages } from '@/lib/repo-filters'

export default function ProjectsPage() {
  const { data: repos, isPending, isError, error, refetch, username } = useGithubRepos()
  // Filtros na URL: links compartilháveis e o "voltar" do navegador restaura a busca.
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const language = searchParams.get('lang') ?? ''

  const languages = useMemo(() => listLanguages(repos ?? []), [repos])
  const visibleRepos = useMemo(
    () => filterRepos(repos ?? [], { query, language }),
    [repos, query, language],
  )

  function updateParam(key: 'q' | 'lang', value: string) {
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

  function renderContent() {
    if (username === null) return <MissingUsernameMessage />
    if (isPending) return <ProjectGridSkeleton />
    if (isError) return <GithubErrorMessage error={error} onRetry={() => refetch()} />

    if (repos.length === 0) {
      return (
        <StatusMessage icon={FolderOpen} title="Nenhum repositório público ainda">
          Assim que houver projetos públicos em @{username}, eles aparecem aqui.
        </StatusMessage>
      )
    }

    return (
      <div className="flex flex-col gap-6">
        <ProjectFilters
          query={query}
          language={language}
          languages={languages}
          onQueryChange={(value) => updateParam('q', value)}
          onLanguageChange={(value) => updateParam('lang', value)}
        />
        <p aria-live="polite" className="font-mono text-xs text-muted">
          {visibleRepos.length} de {repos.length} projetos
        </p>
        {visibleRepos.length > 0 ? (
          <ProjectGrid repos={visibleRepos} />
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
            Nenhum repositório corresponde aos filtros atuais.
          </StatusMessage>
        )}
      </div>
    )
  }

  return (
    <>
      <title>Projetos · Portfólio</title>
      <PageHeading eyebrow="Repositórios" title="Projetos">
        Repositórios públicos do GitHub, do mais recente ao mais antigo. Forks e arquivados ficam de
        fora.
      </PageHeading>
      {renderContent()}
    </>
  )
}
