import { describe, expect, it } from 'vitest'
import { projectPath, ROUTE_PATHS, safeRedirectPath } from '@/routes/route-paths'

describe('safeRedirectPath', () => {
  it('aceita caminhos internos', () => {
    expect(safeRedirectPath('/admin?aba=1')).toBe('/admin?aba=1')
  })

  it('bloqueia open redirect e loops para o login', () => {
    expect(safeRedirectPath('https://malicioso.com')).toBe('/admin')
    expect(safeRedirectPath('//malicioso.com')).toBe('/admin')
    expect(safeRedirectPath('/\\malicioso.com')).toBe('/admin')
    expect(safeRedirectPath('/login')).toBe('/admin')
    expect(safeRedirectPath(undefined)).toBe('/admin')
  })
})

describe('projectPath', () => {
  it('monta a URL canônica do projeto', () => {
    expect(projectPath('portfolio')).toBe(`${ROUTE_PATHS.projects}/portfolio`)
  })

  it('codifica caracteres especiais do nome do repositório', () => {
    expect(projectPath('meu repo#1')).toBe('/projetos/meu%20repo%231')
  })
})
