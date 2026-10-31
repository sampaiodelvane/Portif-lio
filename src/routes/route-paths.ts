// Fonte única dos caminhos da aplicação. Nunca escreva URLs "na mão" em componentes.
export const ROUTE_PATHS = {
  home: '/',
  projects: '/projetos',
  projectDetail: '/projetos/:repoName',
  contact: '/contato',
} as const

/** URL canônica de um projeto: /projetos/:repoName */
export function projectPath(repoName: string): string {
  return `${ROUTE_PATHS.projects}/${encodeURIComponent(repoName)}`
}
