import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface StatusMessageProps {
  icon: LucideIcon
  title: string
  children?: ReactNode
  action?: ReactNode
  /** 'alert' para erros (anunciado por leitores de tela), 'status' para avisos neutros. */
  role?: 'alert' | 'status'
}

/** Bloco padrão para lista vazia, erro e configuração ausente. */
export function StatusMessage({
  icon: Icon,
  title,
  children,
  action,
  role = 'status',
}: StatusMessageProps) {
  return (
    <div
      role={role}
      className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-line px-6 py-10"
    >
      <Icon aria-hidden="true" className="size-6 text-muted" />
      <h2 className="font-serif text-2xl">{title}</h2>
      {children && <div className="max-w-prose text-muted">{children}</div>}
      {action && <div className="pt-1">{action}</div>}
    </div>
  )
}
