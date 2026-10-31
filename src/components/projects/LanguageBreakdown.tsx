import { Skeleton } from '@/components/ui/Skeleton'
import { useRepoLanguages } from '@/hooks/useGithubRepo'

export function LanguageBreakdown({ repoName }: { repoName: string }) {
  const { data: shares, isPending, isError } = useRepoLanguages(repoName)

  if (isPending) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <span className="sr-only">Carregando linguagens…</span>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    )
  }

  // Linguagens são informação complementar: em erro, a seção apenas some.
  if (isError || shares.length === 0) {
    return <p className="text-sm text-muted">Sem dados de linguagem.</p>
  }

  return (
    <ul className="flex flex-col gap-3">
      {shares.map(({ language, percent }, index) => (
        <li key={language} className="flex flex-col gap-1">
          <div className="flex justify-between font-mono text-xs">
            <span>{language}</span>
            <span className="text-muted">{percent.toLocaleString('pt-BR')}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <div
              className={`h-full rounded-full ${index === 0 ? 'bg-accent' : 'bg-muted'}`}
              style={{ width: `${Math.max(percent, 1)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
