import { ArrowLeft, ArrowUpRight, Check, FileQuestion, Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { LanguageBreakdown } from '@/components/projects/LanguageBreakdown'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { usePortfolioProjects } from '@/hooks/usePortfolioProjects'
import { formatCompactNumber, formatDate } from '@/lib/format'
import { githubUrlFor, toSafeExternalUrl } from '@/lib/showcase'
import { ROUTE_PATHS } from '@/routes/route-paths'
import type { ShowcaseProject } from '@/types/portfolio'

export default function ProjectDetailPage() {
  const { slug = '' } = useParams()
  const { projects, username, isGithubLoading } = usePortfolioProjects()
  const project = projects.find((p) => p.slug === slug.toLowerCase())

  return (
    <>
      <title>{`${project?.title ?? 'Projeto não encontrado'} · Portfólio`}</title>
      <Link
        to={ROUTE_PATHS.projects}
        className="mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Todos os projetos
      </Link>
      {project ? (
        <ProjectDetails
          project={project}
          githubUrl={githubUrlFor(project, username)}
          githubLoading={isGithubLoading}
        />
      ) : (
        <StatusMessage icon={FileQuestion} title="Projeto não encontrado">
          Não há projeto com o endereço “{slug}” no portfólio. Ele pode ter sido renomeado.
        </StatusMessage>
      )}
    </>
  )
}

interface ProjectDetailsProps {
  project: ShowcaseProject
  githubUrl: string | null
  githubLoading: boolean
}

function ProjectDetails({ project, githubUrl, githubLoading }: ProjectDetailsProps) {
  const liveUrl = toSafeExternalUrl(project.liveUrl ?? project.github?.homepage)
  const isPublic = project.visibility === 'public'

  return (
    <article className="grid gap-12 lg:grid-cols-[1fr_18rem]">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4">
          <p className="font-mono text-sm uppercase tracking-widest text-muted">
            {project.context}
          </p>
          <h1 className="break-words font-serif text-4xl leading-tight sm:text-5xl">
            {project.title}
          </h1>
          <p className="max-w-prose text-lg text-muted">{project.description}</p>
        </header>

        {(liveUrl || githubUrl) && (
          <div className="flex flex-wrap gap-3">
            {liveUrl && (
              <ExternalButton href={liveUrl} primary>
                Ver online
              </ExternalButton>
            )}
            {githubUrl && (
              <ExternalButton href={githubUrl} primary={!liveUrl}>
                Ver código no GitHub
              </ExternalButton>
            )}
          </div>
        )}

        {project.features.length > 0 && (
          <section aria-labelledby="funcionalidades" className="flex flex-col gap-4">
            <h2 id="funcionalidades" className="font-serif text-2xl">
              Funcionalidades
            </h2>
            <ul className="flex flex-col gap-3">
              {project.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside className="flex flex-col gap-8 lg:border-l lg:border-line lg:pl-8">
        <section aria-labelledby="tecnologias">
          <SideHeading id="tecnologias">Tecnologias</SideHeading>
          <ul className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <li
                key={tech}
                className="rounded-sm border border-line px-2 py-1 font-mono text-xs text-muted"
              >
                {tech}
              </li>
            ))}
          </ul>
        </section>

        {isPublic ? (
          <>
            <GithubStats project={project} loading={githubLoading} />
            <section aria-labelledby="linguagens">
              <SideHeading id="linguagens">Linguagens no repositório</SideHeading>
              <LanguageBreakdown repoName={project.repoName} />
            </section>
          </>
        ) : (
          <p className="flex items-start gap-2 rounded-md border border-line p-4 text-sm text-muted">
            <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            Código-fonte privado. Detalhes técnicos podem ser apresentados sob solicitação.
          </p>
        )}
      </aside>
    </article>
  )
}

function GithubStats({ project, loading }: { project: ShowcaseProject; loading: boolean }) {
  const { github } = project
  if (!github) {
    return loading ? <Skeleton className="h-16 w-full" /> : null
  }
  return (
    <dl className="grid grid-cols-2 gap-4 font-mono text-sm">
      {github.stars > 0 && <Stat label="Estrelas" value={formatCompactNumber(github.stars)} />}
      {github.forks > 0 && <Stat label="Forks" value={formatCompactNumber(github.forks)} />}
      <Stat label="Criado em" value={formatDate(github.createdAt)} />
      <Stat label="Último push" value={formatDate(github.pushedAt)} />
    </dl>
  )
}

function SideHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">
      {children}
    </h2>
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
