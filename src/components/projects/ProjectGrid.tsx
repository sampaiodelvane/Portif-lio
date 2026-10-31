import { type CardHeadingLevel, ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectCardSkeleton } from '@/components/projects/ProjectCardSkeleton'
import type { ShowcaseProject } from '@/types/portfolio'

const GRID = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

interface ProjectGridProps {
  projects: ShowcaseProject[]
  headingLevel?: CardHeadingLevel
  githubLoading?: boolean
}

export function ProjectGrid({ projects, headingLevel, githubLoading }: ProjectGridProps) {
  return (
    <ul className={GRID}>
      {projects.map((project) => (
        <li key={project.slug}>
          <ProjectCard
            project={project}
            headingLevel={headingLevel}
            githubLoading={githubLoading}
          />
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
