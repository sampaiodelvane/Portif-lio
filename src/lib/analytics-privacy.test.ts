import { describe, expect, it } from 'vitest'
import { dropPrivateEvents, isPrivatePath, toAnalyticsRoute } from '@/lib/analytics-privacy'

describe('monitoramento de acessos — privacidade', () => {
  it('descarta eventos da área restrita (painel e login)', () => {
    expect(dropPrivateEvents({ url: 'https://site.dev/admin' })).toBeNull()
    expect(dropPrivateEvents({ url: 'https://site.dev/admin?aba=mensagens' })).toBeNull()
    expect(dropPrivateEvents({ url: 'https://site.dev/login' })).toBeNull()
  })

  it('mantém as páginas públicas', () => {
    const event = { url: 'https://site.dev/projetos/terravis' }
    expect(dropPrivateEvents(event)).toBe(event)
    expect(isPrivatePath('/administracao-de-escalas')).toBe(false)
    expect(isPrivatePath('/contato')).toBe(false)
  })

  it('agrupa páginas de projeto numa rota só para os relatórios', () => {
    expect(toAnalyticsRoute('/projetos/terravis')).toBe('/projetos/[slug]')
    expect(toAnalyticsRoute('/projetos/pagina-de-vinhos/')).toBe('/projetos/[slug]')
    expect(toAnalyticsRoute('/projetos')).toBe('/projetos')
    expect(toAnalyticsRoute('/')).toBe('/')
  })
})
