"use client"

import { Sparkles, Target, TrendingUp, Briefcase } from "lucide-react"

const features = [
  { icon: Target, label: "Career Analysis", desc: "8-dimension AI scan" },
  { icon: TrendingUp, label: "Job Matching", desc: "Fit scores & gaps" },
  { icon: Briefcase, label: "Applications", desc: "Track your pipeline" },
  { icon: Sparkles, label: "Interview Coach", desc: "AI-powered prep" },
]

export function WelcomeStep() {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-violet shadow-glow-lg mb-6">
        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-2">
        Welcome to HirePilot
      </h2>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-md mb-8 leading-relaxed">
        Your AI-powered career operating system. Let&apos;s set up your profile in a few quick steps so we can analyze your career and find the best opportunities for you.
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[var(--color-accent-violet)]/10 shrink-0">
              <f.icon className="h-4 w-4 text-[var(--color-accent-violet)]" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{f.label}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
