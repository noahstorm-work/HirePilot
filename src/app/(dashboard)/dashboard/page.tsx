"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Brain, Target, TrendingUp, Briefcase, BarChart3,
  ArrowRight, Sparkles, ChevronRight, AlertTriangle, Search
} from "lucide-react"

interface DashboardData {
  analysis: any | null
  applications: any[]
  savedJobs: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({ analysis: null, applications: [], savedJobs: [] })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [analysisRes, appsRes, savedRes] = await Promise.all([
      supabase.from("career_analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("saved_jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ])

    setData({
      analysis: analysisRes.data,
      applications: appsRes.data || [],
      savedJobs: savedRes.data || [],
    })
    setLoading(false)
  }

  const score = data.analysis?.interview_readiness_score || 0
  const target = 90
  const applicationsByStatus = {
    Saved: data.applications.filter((a) => a.status === "Saved").length,
    Applied: data.applications.filter((a) => a.status === "Applied").length,
    Interview: data.applications.filter((a) => a.status === "Interview").length,
    Offer: data.applications.filter((a) => a.status === "Offer").length,
    Rejected: data.applications.filter((a) => a.status === "Rejected").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  if (!data.analysis) {
    return (
      <div className="py-8">
        {/* Empty state */}
        <div className="text-center py-20">
          <div className="inline-flex p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-6">
            <Brain className="h-8 w-8 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)] tracking-tight mb-3">
            Welcome to HirePilot AI
          </h1>
          <p className="text-[#a0a0ab] max-w-md mx-auto mb-8">
            Run your first career analysis to discover your Interview Readiness Score and get a personalized improvement plan.
          </p>
          <Link href="/dashboard/career-analysis">
            <Button className="gradient-violet text-white border-0 px-8 py-6 text-base font-semibold hover:opacity-90 group">
              <Sparkles className="h-4 w-4 mr-2" />
              Run Career Analysis
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">Dashboard</h1>
          <p className="text-sm text-[#63636e] mt-1">Your career intelligence at a glance</p>
        </div>
        <Link href="/dashboard/career-analysis">
          <Button variant="outline" size="sm" className="border-[#27272f] text-[#a0a0ab] hover:text-[#fafafa] hover:bg-[#16161a]">
            Re-analyze
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Hero Score Card */}
      <div className="relative rounded-2xl border border-[#1e1e24] bg-[#0f0f12] p-5 sm:p-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-blue-600/5" />
        <div className="relative grid md:grid-cols-[1fr_auto] gap-6 md:gap-8 items-center">
          <div>
            <p className="text-xs font-medium text-[#63636e] uppercase tracking-wider mb-2">Interview Readiness Score</p>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl sm:text-6xl font-bold font-[family-name:var(--font-display)] gradient-text-violet">{score}</span>
              <span className="text-lg sm:text-xl text-[#45454e] font-[family-name:var(--font-display)]">/ 100</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-2 flex-1 max-w-xs rounded-full bg-[#1e1e24] overflow-hidden">
                <div
                  className="h-full rounded-full gradient-violet transition-all duration-1000"
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-xs text-[#63636e]">Target: {target}</span>
            </div>
            <p className="text-sm text-[#a0a0ab]">
              {score >= 80 ? "Great! You're well-positioned for interviews." :
               score >= 60 ? "Good progress. A few improvements could boost your score significantly." :
               "Let's identify what's holding you back and create an improvement plan."}
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="relative">
              <svg className="w-28 h-28 sm:w-40 sm:h-40 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" stroke="#1e1e24" strokeWidth="8" fill="none" />
                <circle cx="60" cy="60" r="52" stroke="url(#dashGradient)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${score * 3.27} ${100 * 3.27}`} />
                <defs>
                  <linearGradient id="dashGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-4xl font-bold font-[family-name:var(--font-display)]">{score}</span>
                <span className="text-xs text-[#63636e]">/ 100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Career Health Scores */}
      <div>
        <h2 className="text-sm font-medium text-[#63636e] uppercase tracking-wider mb-3">Career Health</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "CV Score", value: data.analysis.cv_score || 0, icon: Target, color: "text-violet-400" },
            { label: "LinkedIn", value: data.analysis.linkedin_score || 0, icon: TrendingUp, color: "text-blue-400" },
            { label: "Portfolio", value: data.analysis.portfolio_score || 0, icon: BarChart3, color: "text-emerald-400" },
            { label: "Recruiter Appeal", value: data.analysis.recruiter_appeal_score || 0, icon: Brain, color: "text-amber-400" },
            { label: "Market Fit", value: data.analysis.market_competitiveness_score || 0, icon: Briefcase, color: "text-cyan-400" },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl border border-[#1e1e24] bg-[#0f0f12]">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                <span className="text-xs text-[#63636e]">{item.label}</span>
              </div>
              <p className="text-2xl font-bold font-[family-name:var(--font-display)]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Improvements */}
        <Card className="border-[#1e1e24] bg-[#0f0f12]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#a0a0ab] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-400" />
              Top Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data.analysis.top_improvements || []).slice(0, 5).map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#16161a] border border-[#1e1e24]">
                  <span className="text-sm font-bold font-[family-name:var(--font-mono)] text-emerald-400 shrink-0">
                    +{item.impact || item.points || 3}
                  </span>
                  <div className="h-px w-8 bg-[#27272f] shrink-0" />
                  <span className="text-sm text-[#a0a0ab]">{item.action || item.improvement || item}</span>
                </div>
              ))}
              {(!data.analysis.top_improvements || data.analysis.top_improvements.length === 0) && (
                <p className="text-sm text-[#45454e] text-center py-4">No improvements identified yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Application Pipeline */}
        <Card className="border-[#1e1e24] bg-[#0f0f12]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-[#a0a0ab] flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-400" />
                Application Pipeline
              </CardTitle>
              <Link href="/applications">
                <Button variant="ghost" size="sm" className="text-xs text-[#63636e] hover:text-[#a0a0ab]">
                  View All <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {(["Saved", "Applied", "Interview", "Offer", "Rejected"] as const).map((status) => (
                <div key={status} className="text-center p-3 rounded-lg bg-[#16161a] border border-[#1e1e24] min-w-0">
                  <p className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-display)] truncate">
                    {applicationsByStatus[status]}
                  </p>
                  <p className="text-[10px] text-[#63636e] mt-1 truncate">{status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 30-Day Plan Preview */}
      {data.analysis.thirty_day_plan && (
        <Card className="border-[#1e1e24] bg-[#0f0f12]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#a0a0ab] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              30-Day Career Improvement Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Array.isArray(data.analysis.thirty_day_plan) ? data.analysis.thirty_day_plan : []).slice(0, 4).map((week: any, i: number) => (
                <div key={i} className="p-4 rounded-xl border border-[#1e1e24] bg-[#16161a]">
                  <p className="text-xs font-medium text-violet-400 mb-2">Week {i + 1}</p>
                  <p className="text-sm font-medium text-[#fafafa] mb-1">{week.title || `Week ${i + 1}`}</p>
                  <p className="text-xs text-[#63636e] leading-relaxed">{week.description || week.tasks || JSON.stringify(week)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-3">
        <Link href="/discover">
          <div className="group p-5 rounded-xl border border-[#1e1e24] bg-[#0f0f12] hover:border-violet-500/30 transition-all cursor-pointer">
            <Search className="h-5 w-5 text-violet-400 mb-3" />
            <h3 className="text-sm font-semibold mb-1 font-[family-name:var(--font-display)]">Find Matching Jobs</h3>
            <p className="text-xs text-[#63636e]">Search roles that match your skills and experience</p>
          </div>
        </Link>
        <Link href="/applications">
          <div className="group p-5 rounded-xl border border-[#1e1e24] bg-[#0f0f12] hover:border-blue-500/30 transition-all cursor-pointer">
            <Briefcase className="h-5 w-5 text-blue-400 mb-3" />
            <h3 className="text-sm font-semibold mb-1 font-[family-name:var(--font-display)]">Track Applications</h3>
            <p className="text-xs text-[#63636e]">Manage your pipeline from saved to offer</p>
          </div>
        </Link>
        <Link href="/dashboard/interview-coach">
          <div className="group p-5 rounded-xl border border-[#1e1e24] bg-[#0f0f12] hover:border-emerald-500/30 transition-all cursor-pointer">
            <Sparkles className="h-5 w-5 text-emerald-400 mb-3" />
            <h3 className="text-sm font-semibold mb-1 font-[family-name:var(--font-display)]">Interview Coach</h3>
            <p className="text-xs text-[#63636e]">Generate tailored questions and STAR responses</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
