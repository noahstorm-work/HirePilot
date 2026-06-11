"use client"

interface WeeklyPlanGridProps {
  plan: Array<{ week?: number; actions?: string[]; expected_score?: number; [key: string]: unknown }>
  maxItems?: number
}

export function WeeklyPlanGrid({ plan, maxItems }: WeeklyPlanGridProps) {
  const items = maxItems ? plan.slice(0, maxItems) : plan

  if (!items || items.length === 0) return null

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
      {items.map((week, i) => (
        <div key={i} className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
          <p className="text-[10px] font-semibold text-[var(--color-accent-violet)] mb-1.5">Week {week.week || i + 1}</p>
          <ul className="space-y-1">
            {(week.actions || []).slice(0, 3).map((action, j) => (
              <li key={j} className="flex items-start gap-1.5 text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                <span className="h-1 w-1 rounded-full bg-[var(--color-accent-violet)] mt-1.5 shrink-0" />
                {action}
              </li>
            ))}
          </ul>
          {week.expected_score && (
            <p className="text-[9px] text-[var(--color-accent-emerald)] mt-2 font-medium">Target: {week.expected_score}%</p>
          )}
        </div>
      ))}
    </div>
  )
}
