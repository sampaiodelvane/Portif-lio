import { LogOut } from 'lucide-react'
import { FeaturedPanel } from '@/components/dashboard/FeaturedPanel'
import { MessagesPanel } from '@/components/dashboard/MessagesPanel'
import { PageHeading } from '@/components/PageHeading'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { state, mode, signOut } = useAuth()

  return (
    <>
      <title>Painel · Portfólio</title>
      <meta name="robots" content="noindex" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeading
          eyebrow={mode === 'local' ? 'Painel · modo demonstração' : 'Painel'}
          title="Administração"
        >
          Conectado como {state.user?.email}.
        </PageHeading>
        <button
          type="button"
          onClick={() => signOut()}
          className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm hover:bg-surface"
        >
          <LogOut aria-hidden="true" className="size-4" />
          Sair
        </button>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="mensagens" className="flex flex-col gap-4">
          <h2 id="mensagens" className="font-serif text-2xl">
            Mensagens
          </h2>
          <MessagesPanel />
        </section>
        <section aria-labelledby="destaques" className="flex flex-col gap-4">
          <h2 id="destaques" className="font-serif text-2xl">
            Projetos em destaque
          </h2>
          <FeaturedPanel />
        </section>
      </div>
    </>
  )
}
