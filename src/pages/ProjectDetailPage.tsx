import { ArrowLeft, ArrowUpRight, FileQuestion } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { GithubErrorMessage } from '@/components/projects/GithubErrorMessage'
import { LanguageBreakdown } from '@/components/projects/LanguageBreakdown'
import { MissingUsernameMessage } from '@/components/projects/MissingUsernameMessage'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { useGithubRepo } from '@/hooks/useGithubRepo'
import { formatCompactNumber, formatDate } from '@/lib/format'
import { GithubApiError } from '@/lib/github-api-error'
import { toSafeExternalUrl } from '@/lib/repo-filters'
import { ROUTE_PATHS } from '@/routes/route-paths'
import type { GithubRepo } from '@/types/github'

export default function ProjectDetailPage() {
  const { repoName = '' } = useParams()
  const { data: repo, isPending, isError, error, refetch, username } = useGithubRepo(repoName)

  function renderContent() {
    if (username === null) return <MissingUsernameMessage />
    if (isPending) return <DetailSkeleton />
    if (isError) {
      if (error instanceof GithubApiError && error.kind === 'not-found') {
        return (
          <StatusMessage icon={FileQuestion} title="Projeto não encontrado">
            Não existe repositório público chamado “{repoName}”. Ele pode ter sido renomeado ou
            tornado privado.
          </StatusMessage>
        )
      }
      return <GithubErrorMessage error={error} onRetry={() => refetch()} />
    }
    return <RepoDetails repo={repo} />
  }

  return (
    <>
      <title>{`${repo?.name ?? repoName} · Portfólio`}</title>
      <Link
        to={ROUTE_PATHS.projects}
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Todos os projetos
      </Link>
      {renderContent()}
    </>
  )
}

function RepoDetails({ repo }: { repo: GithubRepo }) {
  const demoUrl = toSafeExternalUrl(repo.homepage)

  return (
    <article className="grid gap-12 lg:grid-cols-[1fr_18rem]">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          {repo.language && (
            <p className="font-mono text-sm uppercase tracking-widest text-muted">
              {repo.language}
            </p>
          )}
          <h1 className="break-words font-serif text-4xl leading-tight sm:text-5xl">{repo.name}</h1>
          <p className="max-w-prose text-lg text-muted">{repo.description ?? 'Sem descrição.'}</p>
        </header>

        <div className="flex flex-wrap gap-3">
          <ExternalButton href={repo.url} primary>
            Ver no GitHub
          </ExternalButton>
          {demoUrl && <ExternalButton href={demoUrl}>Ver demo</ExternalButton>}
        </div>

        {repo.topics.length > 0 && (
          <section aria-labelledby="topicos">
            <h2
              id="topicos"
              className="mb-3 font-mono text-xs uppercase tracking-widest text-muted"
            >
              Tópicos
            </h2>
            <ul className="flex flex-wrap gap-2">
              {repo.topics.map((topic) => (
                <li
                  key={topic}
                  className="rounded-sm border border-line px-2 py-1 font-mono text-xs text-muted"
                >
                  {topic}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside className="flex flex-col gap-8 lg:border-l lg:border-line lg:pl-8">
        <dl className="grid grid-cols-2 gap-4 font-mono text-sm">
          <Stat label="Estrelas" value={formatCompactNumber(repo.stars)} />
          <Stat label="Forks" value={formatCompactNumber(repo.forks)} />
          <Stat label="Criado em" value={formatDate(repo.createdAt)} />
          <Stat label="Último push" value={formatDate(repo.pushedAt)} />
        </dl>
        <section aria-labelledby="linguagens">
          <h2
            id="linguagens"
            className="mb-3 font-mono text-xs uppercase tracking-widest text-muted"
          >
            Linguagens
          </h2>
          <LanguageBreakdown repoName={repo.name} />
        </section>
      </aside>
    </article>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function ExternalButton({
  href,
  primary = false,
  children,
}: {
  href: string
  primary?: boolean
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-md px-5 py-3 ${
        primary ? 'bg-ink text-paper hover:opacity-90' : 'border border-line hover:bg-surface'
      }`}
    >
      {children}
      <ArrowUpRight aria-hidden="true" className="size-4" />
      <span className="sr-only">(abre em nova aba)</span>
    </a>
  )
}

function DetailSkeleton() {
  return (
    <div aria-busy="true" className="grid gap-12 lg:grid-cols-[1fr_18rem]">
      <span className="sr-only">Carregando projeto…</span>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-12 w-40" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
