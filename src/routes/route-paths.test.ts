import { describe, expect, it } from 'vitest'
import { projectPath, ROUTE_PATHS } from '@/routes/route-paths'

describe('projectPath', () => {
  it('monta a URL canônica do projeto', () => {
    expect(projectPath('portfolio')).toBe(`${ROUTE_PATHS.projects}/portfolio`)
  })

  it('codifica caracteres especiais do nome do repositório', () => {
    expect(projectPath('meu repo#1')).toBe('/projetos/meu%20repo%231')
  })
})
