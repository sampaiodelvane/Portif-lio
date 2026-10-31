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
  VITE_SUPABASE_URL: optionalString.pipe(z.url().optional()),
  VITE_SUPABASE_ANON_KEY: optionalString,
  VITE_EMAILJS_SERVICE_ID: optionalString,
  VITE_EMAILJS_TEMPLATE_ID: optionalString,
  VITE_EMAILJS_PUBLIC_KEY: optionalString,
})

export type AppEnv = z.infer<typeof envSchema>

/** Lido sob demanda (não no import) para os testes poderem usar vi.stubEnv. */
export function readEnv(): AppEnv {
  const parsed = envSchema.safeParse(import.meta.env)
  if (!parsed.success) {
    console.error('Variáveis de ambiente inválidas:', z.prettifyError(parsed.error))
    return envSchema.parse({})
  }
  return parsed.data
}

export function getGithubUsername(): string | null {
  return readEnv().VITE_GITHUB_USERNAME ?? null
}

export interface SupabaseConfig {
  url: string
  anonKey: string
}

/** null = sem Supabase → o app usa o backend de demonstração (localStorage). */
export function getSupabaseConfig(): SupabaseConfig | null {
  const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: anonKey } = readEnv()
  return url && anonKey ? { url, anonKey } : null
}

export interface EmailJsConfig {
  serviceId: string
  templateId: string
  publicKey: string
}

export function getEmailJsConfig(): EmailJsConfig | null {
  const env = readEnv()
  const serviceId = env.VITE_EMAILJS_SERVICE_ID
  const templateId = env.VITE_EMAILJS_TEMPLATE_ID
  const publicKey = env.VITE_EMAILJS_PUBLIC_KEY
  return serviceId && templateId && publicKey ? { serviceId, templateId, publicKey } : null
}
