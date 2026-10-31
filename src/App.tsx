import { RouterProvider } from 'react-router/dom'
import { ThemeProvider } from '@/context/ThemeProvider'
import { createAppRouter } from '@/routes/app-routes'

const router = createAppRouter()

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
