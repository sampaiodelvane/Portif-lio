// Importadores das páginas lazy, num só lugar: usados pelo React.lazy (app-routes.tsx)
// e pelo preload por intenção (hover/foco/toque em links). O navegador guarda o módulo
// importado, então chamar o mesmo import() de novo não baixa nada outra vez.
export const pageLoaders = {
  projects: () => import('@/pages/ProjectsPage'),
  projectDetail: () => import('@/pages/ProjectDetailPage'),
  contact: () => import('@/pages/ContactPage'),
  login: () => import('@/pages/LoginPage'),
  dashboard: () => import('@/pages/DashboardPage'),
  notFound: () => import('@/pages/NotFoundPage'),
} as const

export type PageKey = keyof typeof pageLoaders

export function preloadPage(page: PageKey): void {
  // Falha de rede no preload é irrelevante: o clique tenta de novo via React.lazy.
  pageLoaders[page]().catch(() => {})
}

/** Props para espalhar num <Link>: começa a baixar a página quando o usuário demonstra intenção. */
export function preloadOnIntent(page: PageKey) {
  const preload = () => preloadPage(page)
  return { onMouseEnter: preload, onFocus: preload, onTouchStart: preload }
}
