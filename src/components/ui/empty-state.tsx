import { type LucideIcon } from "lucide-react"
import { type ReactNode } from "react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div className="h-14 w-14 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] font-[family-name:var(--font-display)] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] max-w-sm text-center mb-5">
        {description}
      </p>
      {action}
    </div>
  )
}
