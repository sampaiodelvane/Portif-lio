import { zodResolver } from '@hookform/resolvers/zod'
import { CircleAlert, Info, LoaderCircle, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { PageHeading } from '@/components/PageHeading'
import { PageSkeleton } from '@/components/PageSkeleton'
import { FormField, inputClass } from '@/components/ui/FormField'
import { useAuth } from '@/hooks/useAuth'
import { BackendError, DEMO_CREDENTIALS } from '@/lib/backend-error'
import { type LoginFormValues, loginSchema } from '@/lib/contact-schema'
import type { RedirectState } from '@/routes/ProtectedRoute'
import { safeRedirectPath } from '@/routes/route-paths'

export default function LoginPage() {
  const { state, mode, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = safeRedirectPath((location.state as RedirectState | null)?.from)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (state.status === 'loading') return <PageSkeleton />
  if (state.status === 'authenticated') return <Navigate to={redirectTo} replace />

  async function onSubmit({ email, password }: LoginFormValues) {
    setSubmitError(null)
    try {
      await signIn(email, password)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setSubmitError(
        error instanceof BackendError && error.kind === 'invalid-credentials'
          ? 'E-mail ou senha inválidos.'
          : 'Não foi possível entrar agora. Tente novamente.',
      )
    }
  }

  function fillDemo() {
    setValue('email', DEMO_CREDENTIALS.email, { shouldValidate: true })
    setValue('password', DEMO_CREDENTIALS.password, { shouldValidate: true })
  }

  return (
    <>
      <title>Entrar · Portfólio</title>
      <meta name="robots" content="noindex" />
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <PageHeading eyebrow="Área restrita" title="Entrar no painel" />

        {mode === 'local' && (
          <div className="flex items-start gap-3 rounded-md border border-line bg-surface p-4 text-sm">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted" />
            <div className="flex flex-col gap-2">
              <p>
                <strong>Modo demonstração.</strong> Os dados ficam só neste navegador. Use{' '}
                <code className="font-mono">{DEMO_CREDENTIALS.email}</code> /{' '}
                <code className="font-mono">{DEMO_CREDENTIALS.password}</code>.
              </p>
              <button
                type="button"
                onClick={fillDemo}
                className="self-start text-accent underline underline-offset-4"
              >
                Preencher credenciais de demonstração
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <FormField label="E-mail" error={errors.email?.message}>
            <input
              type="email"
              autoComplete="username"
              className={inputClass}
              {...register('email')}
            />
          </FormField>
          <FormField label="Senha" error={errors.password?.message}>
            <input
              type="password"
              autoComplete="current-password"
              className={inputClass}
              {...register('password')}
            />
          </FormField>

          {submitError && (
            <p role="alert" className="flex items-center gap-2 text-sm text-accent">
              <CircleAlert aria-hidden="true" className="size-4" />
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-paper disabled:opacity-60"
          >
            {isSubmitting ? (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
            ) : (
              <LogIn aria-hidden="true" className="size-4" />
            )}
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </>
  )
}
