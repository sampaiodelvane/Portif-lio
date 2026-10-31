import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router/dom'
import { ThemeProvider } from '@/context/ThemeProvider'
import { createQueryClient } from '@/lib/query-client'
import { createAppRouter } from '@/routes/app-routes'

const queryClient = createQueryClient()
const router = createAppRouter()

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
