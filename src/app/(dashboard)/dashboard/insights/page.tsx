"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/ui/metric-card"
import { SectionHeader } from "@/components/ui/section-header"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { BarChart3, TrendingUp, Briefcase, Brain, Target, Sparkles, RefreshCw } from "lucide-react"
import type { CareerAnalysis, Application, Improvement, WeeklyReport } from "@/types"
import { APPLICATION_STATUSES, STATUS_COLORS } from "@/lib/constants"
import { toast } from "sonner"

interface InsightsData {
  analysis: CareerAnalysis | null
  totalApps: number
  byStatus: Record<string, number>
  interviewRate: number
  offerRate: number
  recentApps: Application[]
  weeklyReport: WeeklyReport | null
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const supabase = createClient()

  useEffect(() => { loadInsights() }, [])

  const loadInsights = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Calculate week start for the current week
    const now = new Date()
    const dayOfWeek = now.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() + mondayOffset)
    const weekStartStr = weekStart.toISOString().split("T")[0]

    const [analysisRes, appsRes, weeklyRes] = await Promise.all([
      supabase.from("career_analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("applications").select("*").eq("user_id", user.id),
      supabase.from("weekly_reports").select("*").eq("user_id", user.id).eq("week_start", weekStartStr).maybeSingle(),
    ])
    const apps = appsRes.data || []
    setData({
      analysis: analysisRes.data,
      totalApps: apps.length,
      byStatus: {
        Saved: apps.filter((a) => a.status === "Saved").length,
        Applied: apps.filter((a) => a.status === "Applied").length,
        Interview: apps.filter((a) => a.status === "Interview").length,
        Offer: apps.filter((a) => a.status === "Offer").length,
        Rejected: apps.filter((a) => a.status === "Rejected").length,
      },
      interviewRate: apps.length > 0 ? Math.round((apps.filter((a) => a.status === "Interview" || a.status === "Offer").length / apps.length) * 100) : 0,
      offerRate: apps.length > 0 ? Math.round((apps.filter((a) => a.status === "Offer").length / apps.length) * 100) : 0,
      recentApps: apps.slice(0, 5),
      weeklyReport: weeklyRes.data,
    })
    setLoading(false)
  }

  const handleGenerateReport = async () => {
    setGenerating(true)
    try {
      const res = await fetch("/api/ai/weekly-reports", { method: "POST" })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success("Weekly report generated")
      await loadInsights()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate report"
      toast.error(message)
    }
    setGenerating(false)
  }

  if (loading) return <LoadingScreen />
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Insights"
          description="Your career intelligence and performance metrics"
          icon={<BarChart3 className="h-4 w-4 text-[var(--color-accent-blue)]" />}
        />
        <Button
          onClick={handleGenerateReport}
          disabled={generating}
          className="h-8 px-3 text-[11px] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] bg-transparent"
        >
          <RefreshCw className={`h-3 w-3 mr-1.5 ${generating ? "animate-spin" : ""}`} />
          {generating ? "Generating..." : "Generate Weekly Report"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <MetricCard icon={Briefcase} label="Total Applications" value={data.totalApps} color="text-[var(--color-accent-blue)]" />
        <MetricCard icon={Target} label="Interview Rate" value={`${data.interviewRate}%`} color="text-[var(--color-accent-violet)]" />
        <MetricCard icon={Sparkles} label="Offer Rate" value={`${data.offerRate}%`} color="text-[var(--color-accent-emerald)]" />
        <MetricCard icon={Brain} label="Readiness Score" value={data.analysis?.interview_readiness_score || "—"} color="text-[var(--color-accent-amber)]" />
      </div>

      {/* Weekly Report */}
      {data.weeklyReport && (
        <div className="surface-card p-5">
          <SectionHeader title="This Week's Report" icon={<TrendingUp className="h-4 w-4 text-[var(--color-accent-emerald)]" />} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Skills in Demand</p>
              <ul className="space-y-1">
                {data.weeklyReport.skills_in_demand?.map((s, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
                    <span className="h-1 w-1 rounded-full bg-[var(--color-accent-violet)] shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Market Trends</p>
              <ul className="space-y-1">
                {data.weeklyReport.market_trends?.map((t, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
                    <span className="h-1 w-1 rounded-full bg-[var(--color-accent-blue)] shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-2">Recommendations</p>
              <ul className="space-y-1">
                {data.weeklyReport.recommendations?.map((r, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)]">
                    <span className="h-1 w-1 rounded-full bg-[var(--color-accent-amber)] shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {data.weeklyReport.salary_ranges && (
            <div className="mt-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
              <p className="text-[10px] text-[var(--color-text-tertiary)]">Estimated Salary Range</p>
              <p className="text-sm font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-emerald)]">
                {data.weeklyReport.salary_ranges.currency} {data.weeklyReport.salary_ranges.min.toLocaleString()} - {data.weeklyReport.salary_ranges.max.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Application Funnel */}
        <div className="surface-card p-5">
          <SectionHeader title="Application Funnel" icon={<BarChart3 className="h-4 w-4 text-[var(--color-accent-blue)]" />} />
          <div className="space-y-3 mt-4">
            {APPLICATION_STATUSES.map((status) => {
              const count = data.byStatus[status]
              const pct = data.totalApps > 0 ? Math.round((count / data.totalApps) * 100) : 0
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-[var(--color-text-secondary)]">{status}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${STATUS_COLORS[status].pill}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Career Health */}
        <div className="surface-card p-5">
          <SectionHeader title="Career Health" icon={<Brain className="h-4 w-4 text-[var(--color-accent-violet)]" />} />
          <div className="space-y-3 mt-4">
            {[
              { label: "CV Score", value: data.analysis?.cv_score || 0 },
              { label: "LinkedIn", value: data.analysis?.linkedin_score || 0 },
              { label: "Portfolio", value: data.analysis?.portfolio_score || 0 },
              { label: "Recruiter Appeal", value: data.analysis?.recruiter_appeal_score || 0 },
              { label: "Market Fit", value: data.analysis?.market_competitiveness_score || 0 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[var(--color-text-secondary)]">{item.label}</span>
                  <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent-violet)]">{item.value}/100</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                  <div className="h-full rounded-full gradient-violet transition-all duration-500" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="surface-card p-5">
        <SectionHeader title="Recommendations" icon={<Sparkles className="h-4 w-4 text-[var(--color-accent-amber)]" />} />
        <div className="grid sm:grid-cols-2 gap-2.5 mt-4">
          {(data.analysis?.top_improvements || []).slice(0, 6).map((item: Improvement, i: number) => (
            <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
              <div className="h-7 w-7 rounded-lg bg-[var(--color-accent-violet)]/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-[var(--color-accent-violet)]">+{item.impact || 3}</span>
              </div>
              <span className="text-xs text-[var(--color-text-secondary)]">{item.action}</span>
            </div>
          ))}
          {(!data.analysis?.top_improvements || data.analysis.top_improvements.length === 0) && (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-6 col-span-2">Run a career analysis to get recommendations</p>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div className="surface-card p-5">
        <SectionHeader title="Recent Applications" icon={<Briefcase className="h-4 w-4 text-[var(--color-accent-blue)]" />} />
        <div className="space-y-2 mt-4">
          {data.recentApps.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-6">No applications yet</p>
          ) : data.recentApps.map((app: Application) => (
            <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{app.company}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate">{app.role_title}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  STATUS_COLORS[app.status as keyof typeof STATUS_COLORS]?.bg || "bg-[var(--color-bg-hover)]"
                } ${STATUS_COLORS[app.status as keyof typeof STATUS_COLORS]?.text || "text-[var(--color-text-muted)]"}`}>{app.status}</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">{new Date(app.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
