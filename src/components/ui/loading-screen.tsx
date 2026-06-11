export function LoadingScreen() {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-10 w-10 rounded-full border-2 border-[var(--color-border-subtle)] border-t-[var(--color-accent-violet)] animate-spin" />
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingSkeleton({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="surface-card p-4">
          <div className="flex items-center gap-3">
            <div className="skeleton h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-1/4" />
              <div className="skeleton h-3 w-1/3" />
            </div>
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
