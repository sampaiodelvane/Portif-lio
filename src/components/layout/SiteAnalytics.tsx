import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useLocation } from 'react-router'
import { dropPrivateEvents, toAnalyticsRoute } from '@/lib/analytics-privacy'

/**
 * Monitoramento de acessos (Web Analytics) e de desempenho real (Speed Insights) da Vercel.
 * Carregado com lazy() e só em produção: não pesa no bundle inicial nem roda em dev/testes.
 * Os scripts são servidos pela própria Vercel (/_vercel/...), sem cookies.
 */
export function SiteAnalytics() {
  const { pathname } = useLocation()
  const route = toAnalyticsRoute(pathname)

  return (
    <>
      <Analytics route={route} beforeSend={dropPrivateEvents} />
      <SpeedInsights route={route} beforeSend={dropPrivateEvents} />
    </>
  )
}
