import { Search } from 'lucide-react'

interface ProjectFiltersProps {
  query: string
  language: string
  languages: string[]
  onQueryChange: (value: string) => void
  onLanguageChange: (value: string) => void
}

export function ProjectFilters({
  query,
  language,
  languages,
  onQueryChange,
  onLanguageChange,
}: ProjectFiltersProps) {
  return (
    <search className="flex flex-col gap-3 sm:flex-row">
      <label className="relative flex-1">
        <span className="sr-only">Buscar projetos</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar por nome, descrição ou tópico"
          className="w-full rounded-md border border-line bg-surface py-2.5 pr-3 pl-9 text-sm placeholder:text-muted"
        />
      </label>
      <label className="sm:w-56">
        <span className="sr-only">Filtrar por linguagem</span>
        <select
          value={language}
          onChange={(event) => onLanguageChange(event.target.value)}
          className="w-full rounded-md border border-line bg-surface px-3 py-2.5 text-sm"
        >
          <option value="">Todas as linguagens</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </label>
    </search>
  )
}
