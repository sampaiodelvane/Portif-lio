import type { ReactElement, ReactNode } from 'react'
import { cloneElement, useId } from 'react'

interface FormFieldProps {
  label: string
  error?: string
  hint?: ReactNode
  optional?: boolean
  /** Um único <input>/<textarea>/<select>; recebe id e atributos ARIA automaticamente. */
  children: ReactElement<Record<string, unknown>>
}

export const inputClass =
  'w-full rounded-md border border-line bg-surface px-3 py-2.5 text-base placeholder:text-muted aria-[invalid=true]:border-accent'

/** Liga label, dica e erro ao campo (aria-describedby / aria-invalid) para leitores de tela. */
export function FormField({ label, error, hint, optional = false, children }: FormFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(opcional)</span>}
      </label>
      {cloneElement(children, {
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy || undefined,
      })}
      {hint && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  )
}
