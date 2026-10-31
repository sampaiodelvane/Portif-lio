import { lazy } from 'react'
import type { RouteObject } from 'react-router'
import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { RouteErrorPage } from '@/components/RouteErrorPage'
// Home é estática de propósito (contém o LCP). Ver comentário em pages/HomePage.tsx.
import HomePage from '@/pages/HomePage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { pageLoaders } from '@/routes/page-loaders'
import { ROUTE_PATHS } from '@/routes/route-paths'

// Demais páginas viram chunks próprios: o usuário só baixa o código da rota que visita.
const ProjectsPage = lazy(pageLoaders.projects)
const ProjectDetailPage = lazy(pageLoaders.projectDetail)
const ContactPage = lazy(pageLoaders.contact)
const LoginPage = lazy(pageLoaders.login)
const DashboardPage = lazy(pageLoaders.dashboard)
const NotFoundPage = lazy(pageLoaders.notFound)
// Auth (e o supabase-js, quando configurado) só carrega na área restrita.
const AuthBoundary = lazy(() =>
  import('@/routes/AuthBoundary').then((m) => ({ default: m.AuthBoundary })),
)

export const appRoutes: RouteObject[] = [
  {
    element: <RootLayout />,
    // Última barreira: se o próprio layout quebrar, mostra o erro sem header/footer.
    errorElement: (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <RouteErrorPage />
      </div>
    ),
    children: [
      {
        // Erros das páginas aparecem DENTRO do layout, mantendo a navegação.
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <HomePage /> },
          { path: ROUTE_PATHS.projects, element: <ProjectsPage /> },
          { path: ROUTE_PATHS.projectDetail, element: <ProjectDetailPage /> },
          { path: ROUTE_PATHS.contact, element: <ContactPage /> },
          {
            element: <AuthBoundary />,
            children: [
              { path: ROUTE_PATHS.login, element: <LoginPage /> },
              {
                element: <ProtectedRoute />,
                children: [{ path: ROUTE_PATHS.admin, element: <DashboardPage /> }],
              },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

export function createAppRouter() {
  return createBrowserRouter(appRoutes)
}
