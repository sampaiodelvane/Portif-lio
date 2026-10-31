import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, CircleCheck, LoaderCircle, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { FormField, inputClass } from '@/components/ui/FormField'
import { useSubmitContact } from '@/hooks/useSubmitContact'
import {
  CONTACT_LIMITS,
  type ContactFormInput,
  type ContactFormValues,
  contactSchema,
} from '@/lib/contact-schema'

const EMPTY: ContactFormInput = { name: '', email: '', subject: '', message: '', website: '' }

export function ContactForm() {
  const mutation = useSubmitContact()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput, unknown, ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY,
    // Valida ao sair do campo; depois do primeiro erro, a cada tecla (feedback imediato).
    mode: 'onTouched',
  })

  const messageLength = watch('message')?.length ?? 0

  async function onSubmit({ website, ...input }: ContactFormValues) {
    // Bot preencheu o honeypot: finge sucesso sem enviar nada.
    if (website) {
      mutation.reset()
      reset(EMPTY)
      return
    }
    try {
      await mutation.mutateAsync(input)
      reset(EMPTY)
    } catch {
      // Erro exibido abaixo via mutation.isError; os dados digitados são mantidos.
    }
  }

  if (mutation.isSuccess) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-lg border border-line bg-surface p-6"
      >
        <CircleCheck aria-hidden="true" className="size-6 text-accent" />
        <h2 className="font-serif text-2xl">Mensagem enviada</h2>
        <p className="text-muted">Obrigado pelo contato! Respondo assim que possível.</p>
        <button
          type="button"
          onClick={() => mutation.reset()}
          className="rounded-md border border-line px-4 py-2 text-sm hover:bg-paper"
        >
          Enviar outra mensagem
        </button>
      </div>
    )
  }

  const busy = isSubmitting || mutation.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Nome" error={errors.name?.message}>
          <input type="text" autoComplete="name" className={inputClass} {...register('name')} />
        </FormField>
        <FormField label="E-mail" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            className={inputClass}
            {...register('email')}
          />
        </FormField>
      </div>

      <FormField label="Assunto" optional error={errors.subject?.message}>
        <input type="text" className={inputClass} {...register('subject')} />
      </FormField>

      <FormField
        label="Mensagem"
        error={errors.message?.message}
        hint={`${messageLength}/${CONTACT_LIMITS.message.max} caracteres`}
      >
        <textarea rows={6} className={`${inputClass} resize-y`} {...register('message')} />
      </FormField>

      {/* Honeypot: fora da tela e fora da navegação por teclado/leitor de tela. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Site
          <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
        </label>
      </div>

      {mutation.isError && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-md border border-accent/40 p-3 text-sm"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
          Não foi possível enviar agora. Seus dados foram mantidos, tente novamente em instantes.
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />
          ) : (
            <Send aria-hidden="true" className="size-4" />
          )}
          {busy ? 'Enviando…' : 'Enviar mensagem'}
        </button>
      </div>
    </form>
  )
}
