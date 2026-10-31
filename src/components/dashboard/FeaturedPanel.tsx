import { CircleCheck, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { PORTFOLIO_PROJECTS } from '@/content/projects'
import { useSaveFeatured } from '@/hooks/useAdmin'
import { useFeaturedProjects } from '@/hooks/useFeaturedProjects'

export const MAX_FEATURED = 3

// Opções vêm do catálogo curado (inclui privados), não da API do GitHub.
const OPTIONS = PORTFOLIO_PROJECTS.map(({ slug, title }) => ({ slug, title }))

export function FeaturedPanel() {
  const featured = useFeaturedProjects()
  // A mutação fica aqui (e não no editor) porque o editor é remontado após salvar:
  // o feedback "Destaques salvos" precisa sobreviver a essa remontagem.
  const save = useSaveFeatured()

  if (featured.isPending) {
    return (
      <div aria-busy="true" className="flex flex-col gap-2">
        <span className="sr-only">Carregando destaques…</span>
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
      initial={featured.data ?? []}
      save={save}
    />
  )
}

interface FeaturedEditorProps {
  initial: string[]
  save: ReturnType<typeof useSaveFeatured>
}

function FeaturedEditor({ initial, save }: FeaturedEditorProps) {
  // Destaques salvos que saíram do catálogo são descartados.
  const [selected, setSelected] = useState(() =>
    initial.filter((slug) => OPTIONS.some((option) => option.slug === slug)),
  )
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
        exibição. Sem destaques, a home mostra os três primeiros do catálogo.
      </p>
      <fieldset>
        <legend className="sr-only">Projetos em destaque</legend>
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
          {OPTIONS.map(({ slug, title }) => {
            const position = selected.indexOf(slug)
            const checked = position !== -1
            return (
              <li key={slug}>
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
                    onChange={() => toggle(slug)}
                    className="size-4 accent-[var(--color-accent)]"
                  />
                  <span className="flex-1">{title}</span>
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
