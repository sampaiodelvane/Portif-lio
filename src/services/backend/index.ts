import { getSupabaseConfig } from '@/lib/env'
import type { AdminBackend, PublicBackend } from '@/services/backend/backend-types'
import { localAdminBackend, localPublicBackend } from '@/services/backend/local-backend'
import { createSupabasePublicBackend } from '@/services/backend/supabase-public'

export type BackendMode = 'local' | 'supabase'

/** Supabase se as variáveis existirem; senão, modo demonstração. Decidido em tempo de execução. */
export function getBackendMode(): BackendMode {
  return getSupabaseConfig() ? 'supabase' : 'local'
}

export function getPublicBackend(): PublicBackend {
  const config = getSupabaseConfig()
  return config ? createSupabasePublicBackend(config) : localPublicBackend
}

let adminBackendPromise: Promise<AdminBackend> | null = null

/** Carrega o supabase-js só quando alguém abre /login ou /admin. Instância única. */
export function loadAdminBackend(): Promise<AdminBackend> {
  if (!adminBackendPromise) {
    const config = getSupabaseConfig()
    adminBackendPromise = config
      ? import('@/services/backend/supabase-admin').then((m) =>
          m.createSupabaseAdminBackend(config),
        )
      : Promise.resolve(localAdminBackend)
  }
  return adminBackendPromise
}

/** Só para testes: permite trocar o modo entre cenários. */
export function resetAdminBackendForTests(): void {
  adminBackendPromise = null
}
