"use client"

import { CheckCircle, ArrowRight, Brain, Search, Briefcase } from "lucide-react"

interface CompleteStepProps {
  fullName: string
  skills: string[]
  cvText: string
}

const nextSteps = [
  { icon: Brain, label: "Run Career Analysis", desc: "Get your AI-powered readiness score", color: "text-[var(--color-accent-violet)]" },
  { icon: Search, label: "Discover Jobs", desc: "Find matched opportunities", color: "text-[var(--color-accent-blue)]" },
  { icon: Briefcase, label: "Track Applications", desc: "Build your pipeline", color: "text-[var(--color-accent-emerald)]" },
]

export function CompleteStep({ fullName, skills, cvText }: CompleteStepProps) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="relative mb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-accent-emerald)]/10">
          <CheckCircle className="h-8 w-8 text-[var(--color-accent-emerald)]" />
        </div>
      </div>

      <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-2">
        You&apos;re All Set!
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-md mb-6 leading-relaxed">
        Your profile is ready. Here&apos;s what we&apos;ve captured:
      </p>

      <div className="w-full max-w-sm space-y-2 mb-8">
        {fullName && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
            <span className="text-[11px] text-[var(--color-text-muted)]">Name</span>
            <span className="text-xs font-medium text-[var(--color-text-primary)]">{fullName}</span>
          </div>
        )}
        {skills.length > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
            <span className="text-[11px] text-[var(--color-text-muted)]">Skills</span>
            <span className="text-xs font-medium text-[var(--color-text-primary)]">{skills.length} selected</span>
          </div>
        )}
        {cvText && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
            <span className="text-[11px] text-[var(--color-text-muted)]">CV</span>
            <span className="text-xs font-medium text-[var(--color-text-primary)]">
              {cvText.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        )}
        {!fullName && skills.length === 0 && !cvText && (
          <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
            <span className="text-[11px] text-[var(--color-text-muted)]">
              No data yet — you can fill in details from your Profile page anytime.
            </span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-[var(--color-text-muted)] mb-4 font-medium uppercase tracking-wider">
        What&apos;s Next
      </p>
      <div className="space-y-2 w-full max-w-sm">
        {nextSteps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-left">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shrink-0">
              <step.icon className={`h-4 w-4 ${step.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[var(--color-text-primary)]">{step.label}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">{step.desc}</p>
            </div>
            <ArrowRight className="h-3 w-3 text-[var(--color-text-muted)] shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
