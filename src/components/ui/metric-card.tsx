import { type LucideIcon } from "lucide-react"

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  color?: string
  className?: string
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
  color = "text-[var(--color-accent-violet)]",
  className = "",
}: MetricCardProps) {
  return (
    <div className={`surface-card p-5 transition-default hover:border-[var(--color-border-default)] ${className}`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`h-8 w-8 rounded-[10px] flex items-center justify-center bg-current/10 ${color}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <span className="text-xs text-[var(--color-text-tertiary)] font-medium">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">{value}</p>
        {trend && trendValue && (
          <span className={`text-xs font-medium ${
            trend === "up" ? "text-[var(--color-accent-emerald)]" :
            trend === "down" ? "text-[var(--color-accent-rose)]" :
            "text-[var(--color-text-muted)]"
          }`}>
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "—"} {trendValue}
          </span>
        )}
      </div>
    </div>
  )
}
