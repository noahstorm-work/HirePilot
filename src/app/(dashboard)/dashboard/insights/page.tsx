"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MetricCard } from "@/components/ui/metric-card"
import { SectionHeader } from "@/components/ui/section-header"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { BarChart3, TrendingUp, Briefcase, Brain, Target, Sparkles } from "lucide-react"

export default function InsightsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { loadInsights() }, [])

  const loadInsights = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [analysisRes, appsRes] = await Promise.all([
      supabase.from("career_analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("applications").select("*").eq("user_id", user.id),
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
    })
    setLoading(false)
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Insights"
        description="Your career intelligence and performance metrics"
        icon={<BarChart3 className="h-4 w-4 text-[var(--color-accent-blue)]" />}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <MetricCard icon={Briefcase} label="Total Applications" value={data.totalApps} color="text-[var(--color-accent-blue)]" />
        <MetricCard icon={Target} label="Interview Rate" value={`${data.interviewRate}%`} color="text-[var(--color-accent-violet)]" />
        <MetricCard icon={Sparkles} label="Offer Rate" value={`${data.offerRate}%`} color="text-[var(--color-accent-emerald)]" />
        <MetricCard icon={Brain} label="Readiness Score" value={data.analysis?.interview_readiness_score || "—"} color="text-[var(--color-accent-amber)]" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Application Funnel */}
        <div className="surface-card p-5">
          <SectionHeader title="Application Funnel" icon={<BarChart3 className="h-4 w-4 text-[var(--color-accent-blue)]" />} />
          <div className="space-y-3 mt-4">
            {(["Saved", "Applied", "Interview", "Offer", "Rejected"] as const).map((status) => {
              const count = data.byStatus[status]
              const pct = data.totalApps > 0 ? Math.round((count / data.totalApps) * 100) : 0
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-[var(--color-text-secondary)]">{status}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--color-bg-elevated)] overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${
                      status === "Rejected" ? "bg-[var(--color-accent-rose)]/60" :
                      status === "Offer" ? "bg-[var(--color-accent-emerald)]/60" :
                      status === "Interview" ? "bg-[var(--color-accent-violet)]/60" :
                      status === "Applied" ? "bg-[var(--color-accent-blue)]/60" : "bg-[var(--color-text-muted)]/60"
                    }`} style={{ width: `${pct}%` }} />
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
          {(data.analysis?.top_improvements || []).slice(0, 6).map((item: any, i: number) => (
            <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
              <div className="h-7 w-7 rounded-lg bg-[var(--color-accent-violet)]/10 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-[var(--color-accent-violet)]">+{item.impact || item.points || 3}</span>
              </div>
              <span className="text-xs text-[var(--color-text-secondary)]">{item.action || item.improvement || item}</span>
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
          ) : data.recentApps.map((app: any) => (
            <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{app.company}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] truncate">{app.role_title}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  app.status === "Rejected" ? "bg-[var(--color-accent-rose)]/10 text-[var(--color-accent-rose)]" :
                  app.status === "Offer" ? "bg-[var(--color-accent-emerald)]/10 text-[var(--color-accent-emerald)]" :
                  app.status === "Interview" ? "bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)]" :
                  app.status === "Applied" ? "bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]" :
                  "bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]"
                }`}>{app.status}</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">{new Date(app.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
