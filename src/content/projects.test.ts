import { describe, expect, it } from 'vitest'
import { findProjectBySlug, PORTFOLIO_PROJECTS } from '@/content/projects'
import { toSafeExternalUrl } from '@/lib/showcase'

// Testes de integridade do conteúdo: protegem a vitrine contra erros de edição do catálogo.
describe('catálogo de projetos', () => {
  it('slugs são únicos e em kebab-case (viram URL)', () => {
    const slugs = PORTFOLIO_PROJECTS.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  })

  it('projetos revisados têm resumo curto, descrição e ao menos 3 funcionalidades', () => {
    for (const project of PORTFOLIO_PROJECTS.filter((p) => !p.draft)) {
      expect(project.summary.length, project.slug).toBeLessThanOrEqual(160)
      expect(project.description.length, project.slug).toBeGreaterThan(80)
      expect(project.features.length, project.slug).toBeGreaterThanOrEqual(3)
    }
  })

  it('todo projeto informa ao menos uma tecnologia', () => {
    for (const project of PORTFOLIO_PROJECTS) expect(project.stack.length).toBeGreaterThan(0)
  })

  it('links publicados e de demonstração são http(s) válidos', () => {
    for (const project of PORTFOLIO_PROJECTS) {
      for (const url of [project.liveUrl, project.demoUrl].filter(Boolean)) {
        expect(toSafeExternalUrl(url), project.slug).not.toBeNull()
      }
    }
  })

  it('busca por slug ignora maiúsculas', () => {
    expect(findProjectBySlug('TerraVis')?.title).toBe('TerraVis')
    expect(findProjectBySlug('nao-existe')).toBeUndefined()
  })
})
