import { CircleAlert, RotateCw } from 'lucide-react'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { formatTime } from '@/lib/format'
import { GithubApiError } from '@/lib/github-api-error'

interface GithubErrorMessageProps {
  error: unknown
  onRetry: () => void
}

function describe(error: unknown): { title: string; detail: string; canRetry: boolean } {
  if (error instanceof GithubApiError) {
    switch (error.kind) {
      case 'rate-limit':
        return {
          title: 'Limite da API do GitHub atingido',
          detail: error.resetAt
            ? `A API pública permite 60 consultas por hora. Tente de novo após ${formatTime(error.resetAt)}.`
            : 'A API pública permite 60 consultas por hora. Tente de novo em alguns minutos.',
          canRetry: false,
        }
      case 'not-found':
        return {
          title: 'Usuário do GitHub não encontrado',
          detail: 'Confira o valor de VITE_GITHUB_USERNAME.',
          canRetry: false,
        }
      case 'network':
        return {
          title: 'Sem conexão com o GitHub',
          detail: 'Verifique sua internet e tente novamente.',
          canRetry: true,
        }
      default:
        break
    }
  }
  return {
    title: 'Não foi possível carregar os projetos',
    detail: 'O GitHub não respondeu como esperado. Tente novamente em instantes.',
    canRetry: true,
  }
}

export function GithubErrorMessage({ error, onRetry }: GithubErrorMessageProps) {
  const { title, detail, canRetry } = describe(error)

  return (
    <StatusMessage
      role="alert"
      icon={CircleAlert}
      title={title}
      action={
        canRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm hover:bg-surface"
          >
            <RotateCw aria-hidden="true" className="size-4" />
            Tentar novamente
          </button>
        )
      }
    >
      {detail}
    </StatusMessage>
  )
}
