"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart3, TrendingUp, TrendingDown, Briefcase, Brain,
  Target, Sparkles, ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react"

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
    const analysis = analysisRes.data

    setData({
      analysis,
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

  if (loading) {
    return <div className="flex items-center justify-center py-32"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">Insights</h1>
        <p className="text-sm text-[#63636e] mt-1">Your career intelligence and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Applications", value: data.totalApps, icon: Briefcase, color: "text-blue-400" },
          { label: "Interview Rate", value: `${data.interviewRate}%`, icon: Target, color: "text-violet-400" },
          { label: "Offer Rate", value: `${data.offerRate}%`, icon: Sparkles, color: "text-emerald-400" },
          { label: "Readiness Score", value: data.analysis?.interview_readiness_score || "—", icon: Brain, color: "text-amber-400" },
        ].map((m) => (
          <div key={m.label} className="p-5 rounded-xl border border-[#1e1e24] bg-[#0f0f12]">
            <div className="flex items-center gap-2 mb-3">
              <m.icon className={`h-4 w-4 ${m.color}`} />
              <span className="text-xs text-[#63636e]">{m.label}</span>
            </div>
            <p className="text-3xl font-bold font-[family-name:var(--font-display)]">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Application Funnel */}
        <Card className="border-[#1e1e24] bg-[#0f0f12]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#a0a0ab] flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              Application Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(["Saved", "Applied", "Interview", "Offer", "Rejected"] as const).map((status) => {
                const count = data.byStatus[status]
                const pct = data.totalApps > 0 ? Math.round((count / data.totalApps) * 100) : 0
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#a0a0ab]">{status}</span>
                      <span className="text-xs text-[#63636e]">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#16161a] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          status === "Rejected" ? "bg-rose-500/60" :
                          status === "Offer" ? "bg-emerald-500/60" :
                          status === "Interview" ? "bg-violet-500/60" :
                          status === "Applied" ? "bg-blue-500/60" : "bg-[#45454e]/60"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Career Health */}
        <Card className="border-[#1e1e24] bg-[#0f0f12]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#a0a0ab] flex items-center gap-2">
              <Brain className="h-4 w-4 text-violet-400" />
              Career Health Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "CV Score", value: data.analysis?.cv_score || 0 },
                { label: "LinkedIn Score", value: data.analysis?.linkedin_score || 0 },
                { label: "Portfolio Score", value: data.analysis?.portfolio_score || 0 },
                { label: "Recruiter Appeal", value: data.analysis?.recruiter_appeal_score || 0 },
                { label: "Market Competitiveness", value: data.analysis?.market_competitiveness_score || 0 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#a0a0ab]">{item.label}</span>
                    <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-violet-400">{item.value}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#16161a] overflow-hidden">
                    <div className="h-full rounded-full gradient-violet transition-all duration-500" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-[#1e1e24] bg-[#0f0f12]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[#a0a0ab] flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {(data.analysis?.top_improvements || []).slice(0, 6).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#16161a] border border-[#1e1e24]">
                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-violet-400">+{item.impact || item.points || 3}</span>
                </div>
                <span className="text-sm text-[#a0a0ab]">{item.action || item.improvement || item}</span>
              </div>
            ))}
            {(!data.analysis?.top_improvements || data.analysis.top_improvements.length === 0) && (
              <p className="text-sm text-[#45454e] text-center py-6 col-span-2">Run a career analysis to get personalized recommendations</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card className="border-[#1e1e24] bg-[#0f0f12]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[#a0a0ab] flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-blue-400" />
            Recent Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentApps.length === 0 ? (
            <p className="text-sm text-[#45454e] text-center py-6">No applications yet</p>
          ) : (
            <div className="space-y-2">
              {data.recentApps.map((app: any) => (
                <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-[#16161a]">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{app.company}</p>
                    <p className="text-xs text-[#63636e] truncate">{app.role_title}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      app.status === "Rejected" ? "bg-rose-500/10 text-rose-400" :
                      app.status === "Offer" ? "bg-emerald-500/10 text-emerald-400" :
                      app.status === "Interview" ? "bg-violet-500/10 text-violet-400" :
                      app.status === "Applied" ? "bg-blue-500/10 text-blue-400" :
                      "bg-[#45454e]/10 text-[#63636e]"
                    }`}>{app.status}</span>
                    <span className="text-xs text-[#45454e]">{new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
