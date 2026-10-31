// Mensagens que os navegadores usam quando um chunk do React.lazy não pode ser baixado
// (ex.: usuário com a aba aberta durante um novo deploy, ou rede caiu).
const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /error loading dynamically imported module/i,
  /Loading chunk [\w-]+ failed/i,
]

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(error.message))
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Erro desconhecido'
}
