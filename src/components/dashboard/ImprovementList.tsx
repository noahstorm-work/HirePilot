"use client"

import { EmptyState } from "@/components/ui/empty-state"
import { TrendingUp } from "lucide-react"

interface ImprovementListProps {
  improvements: Array<{ action: string; impact?: string; [key: string]: unknown }>
  emptyTitle?: string
  emptyDescription?: string
  maxItems?: number
}

export function ImprovementList({
  improvements,
  emptyTitle = "No improvements yet",
  emptyDescription = "Run a career analysis to identify improvement opportunities.",
  maxItems,
}: ImprovementListProps) {
  const items = maxItems ? improvements.slice(0, maxItems) : improvements

  if (!items || items.length === 0) {
    return <EmptyState icon={TrendingUp} title={emptyTitle} description={emptyDescription} className="py-6" />
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
          <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent-emerald)] shrink-0">
            +{item.impact || "3"}
          </span>
          <div className="h-px w-6 bg-[var(--color-border-subtle)] shrink-0" />
          <span className="text-xs text-[var(--color-text-secondary)]">{item.action || ""}</span>
        </div>
      ))}
    </div>
  )
}
