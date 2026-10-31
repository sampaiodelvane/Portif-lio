// Fonte única dos caminhos da aplicação. Nunca escreva URLs "na mão" em componentes.
export const ROUTE_PATHS = {
  home: '/',
  projects: '/projetos',
  projectDetail: '/projetos/:repoName',
  contact: '/contato',
  login: '/login',
  admin: '/admin',
} as const

/** URL canônica de um projeto: /projetos/:repoName */
export function projectPath(repoName: string): string {
  return `${ROUTE_PATHS.projects}/${encodeURIComponent(repoName)}`
}

/** Só aceita redirecionar para caminhos internos (evita open redirect via state/URL). */
export function safeRedirectPath(path: unknown, fallback: string = ROUTE_PATHS.admin): string {
  if (typeof path !== 'string') return fallback
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return fallback
  if (path.startsWith(ROUTE_PATHS.login)) return fallback
  return path
}
