interface SkeletonProps {
  className?: string
}

/** Bloco de carregamento. Decorativo: o texto acessível fica no container (aria-busy). */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-line/60 motion-reduce:animate-none ${className}`}
    />
  )
}
