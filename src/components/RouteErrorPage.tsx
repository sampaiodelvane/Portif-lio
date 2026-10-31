import { RotateCw } from 'lucide-react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { NotFoundContent } from '@/components/NotFoundContent'
import { getErrorMessage, isChunkLoadError } from '@/lib/errors'
import { ROUTE_PATHS } from '@/routes/route-paths'

/**
 * errorElement das rotas. Fica fora do code-splitting de propósito:
 * precisa funcionar justamente quando um chunk falha ao carregar.
 */
export function RouteErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundContent />
  }

  const chunkFailed = isChunkLoadError(error)
  const title = chunkFailed ? 'Uma nova versão do site foi publicada' : 'Algo deu errado'
  const description = chunkFailed
    ? 'Não foi possível carregar esta parte da página. Recarregue para buscar a versão mais recente.'
    : 'Ocorreu um erro inesperado ao exibir esta página. Tente novamente em instantes.'

  return (
    <section role="alert" className="flex flex-col items-start gap-4 py-8">
      <title>{`${title} · Portfólio`}</title>
      <p className="font-mono text-sm text-accent">Erro</p>
      <h1 className="font-serif text-4xl sm:text-5xl">{title}</h1>
      <p className="max-w-prose text-lg text-muted">{description}</p>
      {import.meta.env.DEV && (
        <pre className="max-w-full overflow-x-auto rounded-md border border-line bg-surface p-4 font-mono text-sm">
          {getErrorMessage(error)}
        </pre>
      )}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-paper"
        >
          <RotateCw aria-hidden="true" className="size-4" />
          Recarregar
        </button>
        <Link to={ROUTE_PATHS.home} className="rounded-md border border-line px-5 py-3">
          Voltar ao início
        </Link>
      </div>
    </section>
  )
}
