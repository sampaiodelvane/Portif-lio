export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} · Portfólio</p>
        <p className="font-mono text-xs">Vite · React · TypeScript</p>
      </div>
    </footer>
  )
}
