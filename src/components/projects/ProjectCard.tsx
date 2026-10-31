import { GitFork, Star } from 'lucide-react'
import { Link } from 'react-router'
import { formatCompactNumber, formatRelativeDate } from '@/lib/format'
import { preloadOnIntent } from '@/routes/page-loaders'
import { projectPath } from '@/routes/route-paths'
import type { GithubRepo } from '@/types/github'

export type CardHeadingLevel = 'h2' | 'h3'

interface ProjectCardProps {
  repo: GithubRepo
  /** Nível do título conforme a página: h2 logo abaixo do h1, h3 dentro de uma seção com h2. */
  headingLevel?: CardHeadingLevel
}

const MAX_TOPICS = 3

export function ProjectCard({ repo, headingLevel: Heading = 'h3' }: ProjectCardProps) {
  return (
    <article className="group relative flex h-full flex-col gap-3 rounded-lg border border-line bg-surface p-5 transition-colors hover:border-ink/40">
      <Heading className="break-words font-serif text-xl leading-snug">
        {/* O link cobre o card todo (::after), mas o nome continua sendo o texto acessível. */}
        <Link
          to={projectPath(repo.name)}
          {...preloadOnIntent('projectDetail')}
          className="after:absolute after:inset-0 after:rounded-lg after:content-['']"
        >
          {repo.name}
        </Link>
      </Heading>

      <p className="line-clamp-3 flex-1 text-sm text-muted">
        {repo.description ?? 'Sem descrição.'}
      </p>

      {repo.topics.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Tópicos">
          {repo.topics.slice(0, MAX_TOPICS).map((topic) => (
            <li
              key={topic}
              className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-xs text-muted"
            >
              {topic}
            </li>
          ))}
        </ul>
      )}

      <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 font-mono text-xs text-muted">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Linguagem</dt>
            <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
            <dd>{repo.language}</dd>
          </div>
        )}
        <div className="flex items-center gap-1">
          <dt>
            <Star aria-label="Estrelas" className="size-3.5" />
          </dt>
          <dd>{formatCompactNumber(repo.stars)}</dd>
        </div>
        <div className="flex items-center gap-1">
          <dt>
            <GitFork aria-label="Forks" className="size-3.5" />
          </dt>
          <dd>{formatCompactNumber(repo.forks)}</dd>
        </div>
        <div className="ml-auto">
          <dt className="sr-only">Atualizado</dt>
          <dd>
            <time dateTime={repo.pushedAt}>{formatRelativeDate(repo.pushedAt)}</time>
          </dd>
        </div>
      </dl>
    </article>
  )
}
