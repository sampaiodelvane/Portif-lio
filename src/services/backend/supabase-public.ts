import * as z from 'zod/mini'
import { BackendError } from '@/lib/backend-error'
import type { SupabaseConfig } from '@/lib/env'
import type { PublicBackend } from '@/services/backend/backend-types'

// Operações públicas via API REST do Supabase (PostgREST) com fetch puro:
// evita carregar ~50 kB do supabase-js na home e no contato.
// A segurança é das políticas RLS: anônimo só pode INSERIR mensagem e LER destaques.

const featuredSchema = z.array(z.object({ project_slug: z.string(), position: z.number() }))

export function createSupabasePublicBackend({ url, anonKey }: SupabaseConfig): PublicBackend {
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  }

  async function request(path: string, init: RequestInit = {}): Promise<Response> {
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...init,
      headers: { ...headers, ...init.headers },
    })
    if (!response.ok) {
      throw new BackendError('request-failed', `Supabase respondeu ${response.status}`)
    }
    return response
  }

  return {
    async createMessage(input) {
      await request('contact_messages', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(input),
      })
    },

    async listFeatured() {
      const response = await request(
        'featured_projects?select=project_slug,position&order=position',
      )
      return featuredSchema
        .parse(await response.json())
        .map((row) => ({ slug: row.project_slug, position: row.position }))
    },
  }
}
