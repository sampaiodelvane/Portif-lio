import { CircleCheck, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { GithubErrorMessage } from '@/components/projects/GithubErrorMessage'
import { MissingUsernameMessage } from '@/components/projects/MissingUsernameMessage'
import { Skeleton } from '@/components/ui/Skeleton'
import { useSaveFeatured } from '@/hooks/useAdmin'
import { useFeaturedProjects } from '@/hooks/useFeaturedProjects'
import { useGithubRepos } from '@/hooks/useGithubRepos'

export const MAX_FEATURED = 3

export function FeaturedPanel() {
  const repos = useGithubRepos()
  const featured = useFeaturedProjects()
  // A mutação fica aqui (e não no editor) porque o editor é remontado após salvar:
  // o feedback "Destaques salvos" precisa sobreviver a essa remontagem.
  const save = useSaveFeatured()

  if (repos.username === null) return <MissingUsernameMessage />
  if (repos.isError)
    return <GithubErrorMessage error={repos.error} onRetry={() => repos.refetch()} />
  if (repos.isPending || featured.isPending) {
    return (
      <div aria-busy="true" className="flex flex-col gap-2">
        <span className="sr-only">Carregando repositórios…</span>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  // key: remonta o editor quando os destaques salvos mudam (estado inicial sempre atualizado).
  return (
    <FeaturedEditor
      key={(featured.data ?? []).join('|')}
      repoNames={repos.data.map((r) => r.name)}
      initial={featured.data ?? []}
      save={save}
    />
  )
}

interface FeaturedEditorProps {
  repoNames: string[]
  initial: string[]
  save: ReturnType<typeof useSaveFeatured>
}

function FeaturedEditor({ repoNames, initial, save }: FeaturedEditorProps) {
  // Destaques salvos que não existem mais no GitHub são descartados.
  const [selected, setSelected] = useState(() => initial.filter((n) => repoNames.includes(n)))
  const isFull = selected.length >= MAX_FEATURED
  const isDirty = selected.join('|') !== initial.join('|')

  function toggle(name: string) {
    save.reset()
    setSelected((current) =>
      current.includes(name) ? current.filter((n) => n !== name) : [...current, name],
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Escolha até {MAX_FEATURED} projetos para a home. A ordem de seleção define a ordem de
        exibição. Sem destaques, a home mostra os mais recentes.
      </p>
      <fieldset>
        <legend className="sr-only">Projetos em destaque</legend>
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
          {repoNames.map((name) => {
            const position = selected.indexOf(name)
            const checked = position !== -1
            return (
              <li key={name}>
                <label
                  className={`flex items-center gap-3 px-4 py-3 ${
                    !checked && isFull
                      ? 'cursor-not-allowed opacity-50'
                      : 'cursor-pointer hover:bg-surface'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!checked && isFull}
                    onChange={() => toggle(name)}
                    className="size-4 accent-[var(--color-accent)]"
                  />
                  <span className="flex-1 break-all">{name}</span>
                  {checked && (
                    <span className="font-mono text-xs text-accent">#{position + 1}</span>
                  )}
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!isDirty || save.isPending}
          onClick={() => save.mutate(selected)}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-paper disabled:opacity-50"
        >
          {save.isPending && (
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />
          )}
          Salvar destaques
        </button>
        <span aria-live="polite" className="text-sm">
          {save.isSuccess && (
            <span className="inline-flex items-center gap-1.5 text-muted">
              <CircleCheck aria-hidden="true" className="size-4 text-accent" /> Destaques salvos
            </span>
          )}
          {save.isError && <span className="text-accent">Não foi possível salvar.</span>}
        </span>
      </div>
    </div>
  )
}
