// Regras de privacidade do monitoramento de acessos (Vercel Web Analytics + Speed Insights).
// As duas ferramentas não usam cookies nem coletam dados pessoais; aqui ainda tiramos da
// contagem a área restrita, que não é conteúdo público do portfólio.

const PRIVATE_PREFIXES = ['/admin', '/login']

function pathOf(url: string): string {
  try {
    return new URL(url, 'https://portfolio.local').pathname
  } catch {
    return url
  }
}

export function isPrivatePath(url: string): boolean {
  const path = pathOf(url)
  return PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

/** Middleware dos dois SDKs: devolver null descarta o evento. */
export function dropPrivateEvents<T extends { url: string }>(event: T): T | null {
  return isPrivatePath(event.url) ? null : event
}

/**
 * Agrupa URLs dinâmicas para os relatórios ("/projetos/terravis" → "/projetos/[slug]"),
 * assim o desempenho das páginas de projeto aparece consolidado.
 */
export function toAnalyticsRoute(pathname: string): string {
  if (/^\/projetos\/[^/]+\/?$/.test(pathname)) return '/projetos/[slug]'
  return pathname
}
