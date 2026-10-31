import { describe, expect, it, vi } from 'vitest'
import { pageLoaders, preloadOnIntent } from '@/routes/page-loaders'

describe('preloadOnIntent', () => {
  it('dispara o import da página em hover, foco e toque', () => {
    type ContactModule = Awaited<ReturnType<typeof pageLoaders.contact>>
    const spy = vi.spyOn(pageLoaders, 'contact').mockResolvedValue({} as ContactModule)
    const handlers = preloadOnIntent('contact')

    handlers.onMouseEnter()
    handlers.onFocus()
    handlers.onTouchStart()

    expect(spy).toHaveBeenCalledTimes(3)
  })

  it('engole falha de rede do preload (o clique tenta de novo)', async () => {
    vi.spyOn(pageLoaders, 'projects').mockRejectedValue(new Error('offline'))

    expect(() => preloadOnIntent('projects').onMouseEnter()).not.toThrow()
    await Promise.resolve()
  })
})
