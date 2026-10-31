import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { PageSkeleton } from '@/components/PageSkeleton'

export function RootLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      {/* min-h-dvh: o rodapé nasce abaixo da dobra e não "pula" quando a página carrega (CLS). */}
      <main
        id="conteudo"
        tabIndex={-1}
        className="mx-auto min-h-dvh w-full max-w-5xl flex-1 px-4 py-12"
      >
        {/* Cada página é um chunk separado (React.lazy); o skeleton cobre o download. */}
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      <ScrollRestoration />
    </div>
  )
}
