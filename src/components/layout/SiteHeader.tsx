import { Link, NavLink } from 'react-router'
import { ThemeToggle } from '@/components/ThemeToggle'
import { type PageKey, preloadOnIntent } from '@/routes/page-loaders'
import { ROUTE_PATHS } from '@/routes/route-paths'

const NAV_ITEMS: { to: string; label: string; end: boolean; page?: PageKey }[] = [
  { to: ROUTE_PATHS.home, label: 'Início', end: true },
  { to: ROUTE_PATHS.projects, label: 'Projetos', end: false, page: 'projects' },
  { to: ROUTE_PATHS.contact, label: 'Contato', end: false, page: 'contact' },
]

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link to={ROUTE_PATHS.home} className="font-serif text-xl tracking-tight">
          Portfólio
        </Link>
        <div className="flex items-center gap-1 sm:gap-4">
          <nav aria-label="Principal">
            <ul className="flex items-center gap-1 sm:gap-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    {...(item.page ? preloadOnIntent(item.page) : {})}
                    className={({ isActive }) =>
                      `rounded-md px-2 py-2 text-sm transition-colors sm:px-3 ${
                        isActive
                          ? 'text-ink underline decoration-accent decoration-2 underline-offset-8'
                          : 'text-muted hover:text-ink'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
