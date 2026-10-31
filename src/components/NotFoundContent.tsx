import { Link } from 'react-router'
import { ROUTE_PATHS } from '@/routes/route-paths'

export function NotFoundContent() {
  return (
    <section className="flex flex-col items-start gap-4 py-8">
      <p className="font-mono text-sm text-accent">Erro 404</p>
      <h1 className="font-serif text-4xl sm:text-5xl">Página não encontrada</h1>
      <p className="max-w-prose text-lg text-muted">
        O endereço pode ter mudado ou nunca ter existido. Confira a URL ou volte para o início.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link to={ROUTE_PATHS.home} className="rounded-md bg-ink px-5 py-3 text-paper">
          Voltar ao início
        </Link>
        <Link to={ROUTE_PATHS.projects} className="rounded-md border border-line px-5 py-3">
          Ver projetos
        </Link>
      </div>
    </section>
  )
}
