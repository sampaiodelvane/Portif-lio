import type { ReactNode } from 'react'

interface PageHeadingProps {
  eyebrow?: string
  title: string
  children?: ReactNode
}

export function PageHeading({ eyebrow, title, children }: PageHeadingProps) {
  return (
    <header className="flex flex-col gap-4 pb-8">
      {eyebrow && (
        <p className="font-mono text-sm uppercase tracking-widest text-muted">{eyebrow}</p>
      )}
      <h1 className="break-words font-serif text-4xl leading-tight sm:text-5xl">{title}</h1>
      {children && <p className="max-w-prose text-lg text-muted">{children}</p>}
    </header>
  )
}
