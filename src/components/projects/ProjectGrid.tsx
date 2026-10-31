import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectCardSkeleton } from '@/components/projects/ProjectCardSkeleton'
import type { GithubRepo } from '@/types/github'

const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

export function ProjectGrid({ repos }: { repos: GithubRepo[] }) {
  return (
    <ul className={GRID}>
      {repos.map((repo) => (
        <li key={repo.id}>
          <ProjectCard repo={repo} />
        </li>
      ))}
    </ul>
  )
}

export function ProjectGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando projetos…</span>
      <ul className={GRID} aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: lista estática de placeholders
          <li key={index}>
            <ProjectCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  )
}
