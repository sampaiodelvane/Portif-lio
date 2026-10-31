import { Skeleton } from '@/components/ui/Skeleton'

/** Fallback do Suspense enquanto o chunk da página é baixado. */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6 py-4">
      <span className="sr-only">Carregando página…</span>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-10 w-3/4" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}
