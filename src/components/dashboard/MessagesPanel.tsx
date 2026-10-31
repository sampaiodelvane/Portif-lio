import { CircleAlert, Inbox, Mail, MailOpen, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { StatusMessage } from '@/components/ui/StatusMessage'
import { useAdminMessages, useDeleteMessage, useSetMessageRead } from '@/hooks/useAdmin'
import { BackendError } from '@/lib/backend-error'
import { formatDate, formatRelativeDate } from '@/lib/format'
import type { ContactMessage } from '@/types/contact'

type Filter = 'all' | 'unread'

export function MessagesPanel() {
  const { data: messages, isPending, isError, error, refetch } = useAdminMessages()
  const [filter, setFilter] = useState<Filter>('all')

  if (isPending) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <span className="sr-only">Carregando mensagens…</span>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (isError) {
    const expired = error instanceof BackendError && error.kind === 'unauthorized'
    return (
      <StatusMessage
        role="alert"
        icon={CircleAlert}
        title={expired ? 'Sem permissão ou sessão expirada' : 'Erro ao carregar mensagens'}
        action={
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md border border-line px-4 py-2 text-sm"
          >
            Tentar novamente
          </button>
        }
      >
        {expired ? 'Saia e entre novamente com uma conta de administrador.' : error.message}
      </StatusMessage>
    )
  }

  const unreadCount = messages.filter((m) => !m.readAt).length
  const visible = filter === 'unread' ? messages.filter((m) => !m.readAt) : messages

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex gap-2">
        <legend className="sr-only">Filtrar mensagens</legend>
        {(
          [
            ['all', `Todas (${messages.length})`],
            ['unread', `Não lidas (${unreadCount})`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className="rounded-md border border-line px-3 py-1.5 text-sm aria-pressed:bg-ink aria-pressed:text-paper"
          >
            {label}
          </button>
        ))}
      </fieldset>

      {visible.length === 0 ? (
        <StatusMessage icon={Inbox} title="Nenhuma mensagem">
          {filter === 'unread'
            ? 'Tudo lido por aqui.'
            : 'As mensagens enviadas pelo formulário de contato aparecem aqui.'}
        </StatusMessage>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((message) => (
            <li key={message.id}>
              <MessageItem message={message} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MessageItem({ message }: { message: ContactMessage }) {
  const setRead = useSetMessageRead()
  const remove = useDeleteMessage()
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const isUnread = !message.readAt

  return (
    <article
      className={`flex flex-col gap-3 rounded-lg border p-5 ${
        isUnread ? 'border-ink/30 bg-surface' : 'border-line'
      }`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="flex items-center gap-2 font-medium">
          {isUnread && (
            <span className="size-2 rounded-full bg-accent">
              <span className="sr-only">Não lida:</span>
            </span>
          )}
          {message.subject || 'Sem assunto'}
        </h3>
        <time
          dateTime={message.createdAt}
          title={formatDate(message.createdAt)}
          className="font-mono text-xs text-muted"
        >
          {formatRelativeDate(message.createdAt)}
        </time>
      </header>
      <p className="text-sm text-muted">
        {message.name} ·{' '}
        <a href={`mailto:${message.email}`} className="underline underline-offset-4 hover:text-ink">
          {message.email}
        </a>
      </p>
      <p className="whitespace-pre-line break-words">{message.message}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => setRead.mutate({ id: message.id, read: isUnread })}
          className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-sm hover:bg-surface"
        >
          {isUnread ? (
            <MailOpen aria-hidden="true" className="size-4" />
          ) : (
            <Mail aria-hidden="true" className="size-4" />
          )}
          {isUnread ? 'Marcar como lida' : 'Marcar como não lida'}
        </button>
        {confirmingDelete ? (
          <>
            <button
              type="button"
              onClick={() => remove.mutate(message.id)}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm text-accent-ink"
            >
              <Trash2 aria-hidden="true" className="size-4" />
              Confirmar exclusão
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="rounded-md px-3 py-1.5 text-sm text-muted hover:text-ink"
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted hover:text-ink"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Excluir
          </button>
        )}
      </div>
    </article>
  )
}
