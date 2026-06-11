"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { ScoreRing } from "@/components/ui/score-ring"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingScreen } from "@/components/ui/loading-screen"
import Link from "next/link"
import {
  Brain, Target, TrendingUp, BarChart3, Briefcase,
  ArrowRight, Sparkles, Search,
  FileCheck
} from "lucide-react"
import type { Application, CareerAnalysis, Improvement, WeeklyPlan } from "@/types"
import { APPLICATION_STATUSES } from "@/lib/constants"

interface DashboardData {
  analysis: CareerAnalysis | null
  applications: Application[]
  savedJobs: Record<string, unknown>[]
}

const QUICK_ACTIONS = [
  { label: "Run Analysis", href: "/dashboard/career-analysis", icon: Brain, color: "text-[var(--color-accent-violet)]" },
  { label: "Find Jobs", href: "/discover", icon: Search, color: "text-[var(--color-accent-blue)]" },
  { label: "Coach Me", href: "/dashboard/interview-coach", icon: Sparkles, color: "text-[var(--color-accent-emerald)]" },
  { label: "ATS Check", href: "/dashboard/ats-checker", icon: FileCheck, color: "text-[var(--color-accent-amber)]" },
]

const CAREER_HEALTH_METRICS = [
  { label: "CV Score", icon: Target, color: "text-[var(--color-accent-violet)]", key: "cv_score" as const },
  { label: "LinkedIn", icon: TrendingUp, color: "text-[var(--color-accent-blue)]", key: "linkedin_score" as const },
  { label: "Portfolio", icon: BarChart3, color: "text-[var(--color-accent-emerald)]", key: "portfolio_score" as const },
  { label: "Recruiter Appeal", icon: Brain, color: "text-[var(--color-accent-amber)]", key: "recruiter_appeal_score" as const },
  { label: "Market Fit", icon: Briefcase, color: "text-[var(--color-accent-cyan)]", key: "market_competitiveness_score" as const },
]

export function DashboardClient() {
  const [data, setData] = useState<DashboardData>({ analysis: null, applications: [], savedJobs: [] })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [analysisRes, appsRes, savedRes] = await Promise.all([
        supabase.from("career_analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("saved_jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ])

      if (mounted) {
        setData({
          analysis: analysisRes.data,
          applications: appsRes.data || [],
          savedJobs: savedRes.data || [],
        })
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const appsByStatus = useMemo(() => {
    const counts = { Saved: 0, Applied: 0, Interview: 0, Offer: 0, Rejected: 0 }
    for (const app of data.applications) {
      if (app.status in counts) counts[app.status as keyof typeof counts]++
    }
    return counts
  }, [data.applications])

  if (loading) return <LoadingScreen />

  if (!data.analysis) {
    return (
      <div className="py-8">
        <EmptyState
          icon={Brain}
          title="Welcome to HirePilot AI"
          description="Run your first career analysis to discover your Interview Readiness Score and get a personalized improvement plan."
          action={
            <Link href="/dashboard/career-analysis">
              <Button className="gradient-violet text-white border-0 px-6 py-2.5 text-sm font-semibold hover:opacity-90 shadow-glow group">
                <Sparkles className="h-4 w-4 mr-2" />
                Run Career Analysis
                <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  const score = data.analysis.interview_readiness_score || 0
  const target = data.analysis.target_score || 90

  return (
    <div className="space-y-6">
      {/* Hero Score */}
      <div className="relative rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] p-6 sm:p-8 overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent-violet)]/5 via-transparent to-[var(--color-accent-blue)]/5" />
        <div className="relative grid sm:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Interview Readiness Score</p>
            <div className="flex items-baseline gap-2.5 mb-4">
              <span className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-display)] gradient-text-violet">{score}</span>
              <span className="text-base text-[var(--color-text-muted)] font-[family-name:var(--font-display)]">/ 100</span>
            </div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-1.5 flex-1 max-w-[200px] rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                <div className="h-full rounded-full gradient-violet transition-all duration-1000" style={{ width: `${score}%` }} />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)]">Target: {target}</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {score >= 80 ? "You're well-positioned for interviews." :
               score >= 60 ? "A few improvements could boost your score significantly." :
               "Let's identify what's holding you back."}
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <ScoreRing score={score} size="xl" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="group flex items-center gap-2.5 p-3.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-default cursor-pointer">
              <action.icon className={`h-4 w-4 ${action.color} shrink-0`} />
              <span className="text-xs font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">{action.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Career Health */}
      <div>
        <SectionHeader title="Career Health" description="Your key metrics" icon={<BarChart3 className="h-4 w-4 text-[var(--color-accent-violet)]" />} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-3">
          {CAREER_HEALTH_METRICS.map((item) => (
            <div key={item.label} className="surface-card p-4 transition-default hover:border-[var(--color-border-default)]">
              <div className="flex items-center gap-2 mb-2.5">
                <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                <span className="text-[10px] text-[var(--color-text-muted)]">{item.label}</span>
              </div>
              <p className="text-xl font-bold font-[family-name:var(--font-display)]">{data.analysis?.[item.key] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top Improvements */}
        <div className="surface-card">
          <div className="p-5 pb-0">
            <SectionHeader
              title="Top Improvements"
              description="Ranked by impact"
              icon={<TrendingUp className="h-4 w-4 text-[var(--color-accent-emerald)]" />}
            />
          </div>
          <div className="p-5 space-y-2">
            {(data.analysis.top_improvements || []).slice(0, 5).map((item: Improvement, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent-emerald)] shrink-0">
                  +{item.impact || "3"}
                </span>
                <div className="h-px w-6 bg-[var(--color-border-subtle)] shrink-0" />
                <span className="text-xs text-[var(--color-text-secondary)]">{item.action || ""}</span>
              </div>
            ))}
            {(!data.analysis.top_improvements || data.analysis.top_improvements.length === 0) && (
              <EmptyState icon={TrendingUp} title="No improvements yet" description="Run a career analysis to identify improvement opportunities." className="py-6" />
            )}
          </div>
        </div>

        {/* Application Pipeline */}
        <div className="surface-card">
          <div className="p-5 pb-0">
            <SectionHeader
              title="Application Pipeline"
              description={`${data.applications.length} total`}
              icon={<Briefcase className="h-4 w-4 text-[var(--color-accent-blue)]" />}
              action={{ label: "View All", href: "/applications" }}
            />
          </div>
          <div className="p-5">
            <div className="grid grid-cols-5 gap-2">
              {APPLICATION_STATUSES.map((status) => (
                <div key={status} className="text-center p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                  <p className="text-lg sm:text-xl font-bold font-[family-name:var(--font-display)]">
                    {appsByStatus[status]}
                  </p>
                  <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5 truncate">{status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Plan */}
      {data.analysis.thirty_day_plan && (
        <div className="surface-card">
          <div className="p-5 pb-0">
            <SectionHeader
              title="30-Day Career Roadmap"
              description="Your improvement plan"
              icon={<Sparkles className="h-4 w-4 text-[var(--color-accent-amber)]" />}
              action={{ label: "View Full Plan", href: "/dashboard/career-analysis" }}
            />
          </div>
          <div className="p-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(Array.isArray(data.analysis.thirty_day_plan) ? data.analysis.thirty_day_plan : []).slice(0, 4).map((week: WeeklyPlan, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                  <p className="text-[10px] font-semibold text-[var(--color-accent-violet)] mb-1.5">Week {week.week || i + 1}</p>
                  <ul className="space-y-1">
                    {(week.actions || []).slice(0, 3).map((action: string, j: number) => (
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
          </div>
        </div>
      )}
    </div>
  )
}
