import { z } from 'zod'

// Único ponto do app que lê import.meta.env (regra do CLAUDE.md).
// String vazia no .env conta como "não configurado".
const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))

const envSchema = z.object({
  VITE_GITHUB_USERNAME: optionalString.pipe(
    z
      .string()
      .regex(/^[a-z\d](?:[a-z\d-]{0,38})$/i, 'Usuário do GitHub inválido')
      .optional(),
  ),
})

export type AppEnv = z.infer<typeof envSchema>

/** Lido sob demanda (não no import) para os testes poderem usar vi.stubEnv. */
export function readEnv(): AppEnv {
  const parsed = envSchema.safeParse(import.meta.env)
  if (!parsed.success) {
    console.error('Variáveis de ambiente inválidas:', z.prettifyError(parsed.error))
    return {}
  }
  return parsed.data
}

export function getGithubUsername(): string | null {
  return readEnv().VITE_GITHUB_USERNAME ?? null
}
