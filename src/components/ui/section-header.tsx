import { type ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface SectionHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    href: string
  }
  icon?: ReactNode
  className?: string
}

export function SectionHeader({
  title,
  description,
  action,
  icon,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-2.5">
        {icon && (
          <div className="h-8 w-8 rounded-[10px] flex items-center justify-center bg-[var(--color-accent-violet)]/10">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && (
        <Link
          href={action.href}
          className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-accent-violet)] transition-colors shrink-0"
        >
          {action.label}
          <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  )
}
