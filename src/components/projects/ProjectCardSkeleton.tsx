import { Skeleton } from '@/components/ui/Skeleton'

/** Mesmo tamanho do ProjectCard para não haver "pulo" de layout (CLS) ao carregar. */
export function ProjectCardSkeleton() {
  return (
    <div className="flex h-full flex-col gap-3 rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-6 w-2/3" />
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-16" />
      </div>
      <div className="flex gap-4 border-t border-line pt-3">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-8" />
        <Skeleton className="h-3.5 w-8" />
      </div>
    </div>
  )
}
