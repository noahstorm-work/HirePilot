"use client"

import { Target, TrendingUp, BarChart3, Brain, Briefcase } from "lucide-react"

interface CareerHealthScoresProps {
  scores: {
    cv_score?: number | null
    linkedin_score?: number | null
    portfolio_score?: number | null
    recruiter_appeal_score?: number | null
    market_competitiveness_score?: number | null
  }
}

export function CareerHealthScores({ scores }: CareerHealthScoresProps) {
  const items = [
    { label: "CV Score", value: scores.cv_score || 0, icon: Target, color: "text-[var(--color-accent-violet)]" },
    { label: "LinkedIn", value: scores.linkedin_score || 0, icon: TrendingUp, color: "text-[var(--color-accent-blue)]" },
    { label: "Portfolio", value: scores.portfolio_score || 0, icon: BarChart3, color: "text-[var(--color-accent-emerald)]" },
    { label: "Recruiter Appeal", value: scores.recruiter_appeal_score || 0, icon: Brain, color: "text-[var(--color-accent-amber)]" },
    { label: "Market Fit", value: scores.market_competitiveness_score || 0, icon: Briefcase, color: "text-[var(--color-accent-cyan)]" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-3">
      {items.map((item) => (
        <div key={item.label} className="surface-card p-4 transition-default hover:border-[var(--color-border-default)]">
          <div className="flex items-center gap-2 mb-2.5">
            <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
            <span className="text-[10px] text-[var(--color-text-muted)]">{item.label}</span>
          </div>
          <p className="text-xl font-bold font-[family-name:var(--font-display)]">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
