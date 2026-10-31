import { Lock, Star } from 'lucide-react'
import { Link } from 'react-router'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCompactNumber, formatRelativeDate } from '@/lib/format'
import { preloadOnIntent } from '@/routes/page-loaders'
import { projectPath } from '@/routes/route-paths'
import type { ShowcaseProject } from '@/types/portfolio'

export type CardHeadingLevel = 'h2' | 'h3'

interface ProjectCardProps {
  project: ShowcaseProject
  /** Nível do título conforme a página: h2 logo abaixo do h1, h3 dentro de uma seção com h2. */
  headingLevel?: CardHeadingLevel
  /** Dados do GitHub ainda chegando: reserva o espaço do rodapé (sem salto de layout). */
  githubLoading?: boolean
}

const MAX_STACK = 4

export function ProjectCard({
  project,
  headingLevel: Heading = 'h3',
  githubLoading = false,
}: ProjectCardProps) {
  const { github } = project

  return (
    <article className="group relative flex h-full flex-col gap-3 rounded-lg border border-line bg-surface p-5 transition-colors hover:border-ink/40">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{project.context}</p>
        <Heading className="break-words font-serif text-xl leading-snug">
          {/* O link cobre o card todo (::after), mas o título continua sendo o texto acessível. */}
          <Link
            to={projectPath(project.slug)}
            {...preloadOnIntent('projectDetail')}
            className="after:absolute after:inset-0 after:rounded-lg after:content-['']"
          >
            {project.title}
          </Link>
        </Heading>
      </div>

      <p className="line-clamp-3 flex-1 text-sm text-muted">{project.summary}</p>

      <ul className="flex flex-wrap gap-1.5" aria-label="Tecnologias">
        {project.stack.slice(0, MAX_STACK).map((tech) => (
          <li
            key={tech}
            className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-xs text-muted"
          >
            {tech}
          </li>
        ))}
      </ul>

      <div className="flex min-h-5 flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 font-mono text-xs text-muted">
        {project.visibility === 'private' ? (
          <span className="inline-flex items-center gap-1.5">
            <Lock aria-hidden="true" className="size-3.5" />
            Código privado
          </span>
        ) : github ? (
          <>
            {/* "0 estrelas" não agrega à vitrine: o número só aparece quando existe. */}
            {github.stars > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star aria-label="Estrelas" className="size-3.5" />
                {formatCompactNumber(github.stars)}
              </span>
            )}
            <span className="ml-auto">
              Atualizado{' '}
              <time dateTime={github.pushedAt}>{formatRelativeDate(github.pushedAt)}</time>
            </span>
          </>
        ) : githubLoading ? (
          <Skeleton className="h-3.5 w-32" />
        ) : (
          <span>Código aberto no GitHub</span>
        )}
      </div>
    </article>
  )
}
