import { Link } from 'react-router'
import { ROUTE_PATHS } from '@/routes/route-paths'

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} · Portfólio</p>
        <div className="flex items-center gap-4">
          <p className="font-mono text-xs">Vite · React · TypeScript</p>
          <Link to={ROUTE_PATHS.admin} className="text-xs hover:text-ink">
            Área restrita
          </Link>
        </div>
      </div>
    </footer>
  )
}
