import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router'
import { ThemeProvider } from '@/context/ThemeProvider'
import { appRoutes } from '@/routes/app-routes'

/** Renderiza o app (ou rotas customizadas) numa URL, com providers reais e cache isolado. */
export function renderRoute(path: string, routes: RouteObject[] = appRoutes) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Number.POSITIVE_INFINITY } },
  })
  const router = createMemoryRouter(routes, { initialEntries: [path] })

  render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>,
  )
  return { router, queryClient }
}
