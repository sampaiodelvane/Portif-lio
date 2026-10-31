// Placeholder da Fase 1. Na Fase 2 o App passa a montar Providers + Router.
export function App() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 px-4 py-16">
      <p className="font-mono text-sm uppercase tracking-widest text-muted">Portfólio · CP3</p>
      <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
        Projetos, código e decisões.
      </h1>
      <p className="max-w-prose text-lg text-muted">
        Setup inicial pronto. As próximas fases adicionam rotas, integração com o GitHub, contato e
        painel administrativo.
      </p>
      <hr className="w-16 border-t-2 border-accent" />
    </main>
  )
}
