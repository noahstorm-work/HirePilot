"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft, Brain, Sparkles, Target, TrendingUp,
  Briefcase, Mail, MessageSquare, ExternalLink,
  ChevronRight, AlertTriangle, CheckCircle2
} from "lucide-react"
import Link from "next/link"

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [app, setApp] = useState<any>(null)
  const [aiResult, setAiResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<"analysis" | "cover" | "followup">("analysis")
  const supabase = createClient()

  useEffect(() => { loadApplication() }, [params.id])

  const loadApplication = async () => {
    const { data } = await supabase.from("applications").select("*").eq("id", params.id).single()
    if (data) {
      setApp(data)
      const { data: ai } = await supabase.from("ai_results").select("*").eq("application_id", params.id).maybeSingle()
      if (ai) setAiResult(ai)
    }
    setLoading(false)
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const res = await fetch("/api/ai/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_id: app.id,
          job_url: app.job_url,
          job_description: app.notes || "",
          company: app.company,
          role: app.role_title,
        }),
      })
      const json = await res.json()
      if (json.success) setAiResult(json.data)
    } catch {}
    setAnalyzing(false)
  }

  const handleStatusChange = async (status: string) => {
    await supabase.from("applications").update({ status }).eq("id", app.id)
    setApp({ ...app, status })
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>
  }

  if (!app) {
    return <div className="text-center py-20 text-[#63636e]">Application not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link href="/applications" className="text-xs text-[#63636e] hover:text-[#a0a0ab] flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to Applications
          </Link>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">{app.company}</h1>
          <p className="text-sm text-[#63636e] mt-1">{app.role_title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={app.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-[#16161a] border border-[#1e1e24] text-[#a0a0ab] focus:border-violet-500"
          >
            {["Saved", "Applied", "Interview", "Offer", "Rejected"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {app.job_url && (
            <a href={app.job_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-[#27272f] text-[#a0a0ab]">
                <ExternalLink className="h-3.5 w-3.5 mr-1" /> View Job
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="p-6 rounded-2xl border border-[#1e1e24] bg-[#0f0f12]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-[#a0a0ab] flex items-center gap-2">
            <Brain className="h-4 w-4 text-violet-400" />
            AI Job Analysis
          </h2>
          {!aiResult && (
            <Button onClick={handleAnalyze} disabled={analyzing} size="sm" className="gradient-violet text-white border-0 hover:opacity-90">
              {analyzing ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" /> : <Sparkles className="h-3.5 w-3.5 mr-2" />}
              {analyzing ? "Analyzing..." : "Run Analysis"}
            </Button>
          )}
        </div>

        {aiResult ? (
          <div className="space-y-4">
            {/* Match Score */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#16161a] border border-[#1e1e24]">
              <div className="text-center">
                <p className="text-3xl font-bold font-[family-name:var(--font-display)] gradient-text-violet">{aiResult.match_score || 0}</p>
                <p className="text-xs text-[#63636e]">Match Score</p>
              </div>
              <div className="h-12 w-px bg-[#1e1e24]" />
              <div className="flex-1">
                <p className="text-xs text-[#63636e] mb-1">Estimated Interview Probability</p>
                <p className="text-sm font-medium">{aiResult.match_score >= 80 ? "High" : aiResult.match_score >= 60 ? "Medium" : "Low"}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-lg bg-[#16161a] border border-[#1e1e24] overflow-x-auto w-full">
              {[
                { key: "analysis", label: "Analysis", icon: Target },
                { key: "cover", label: "Cover Letter", icon: Mail },
                { key: "followup", label: "Follow-up", icon: MessageSquare },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-violet-500/10 text-violet-400 font-medium" : "text-[#63636e] hover:text-[#a0a0ab]"}`}>
                  <tab.icon className="h-3 w-3" /> {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "analysis" && (
              <div className="space-y-4">
                {aiResult.strengths?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#16161a] border border-[#1e1e24]">
                    <h3 className="text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Strengths</h3>
                    <ul className="space-y-1">{aiResult.strengths.map((s: string, i: number) => <li key={i} className="text-sm text-[#a0a0ab]">• {s}</li>)}</ul>
                  </div>
                )}
                {aiResult.missing_skills?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#16161a] border border-[#1e1e24]">
                    <h3 className="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Missing Skills</h3>
                    <div className="flex flex-wrap gap-2">{aiResult.missing_skills.map((s: string, i: number) => <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">{s}</span>)}</div>
                  </div>
                )}
                {aiResult.cv_suggestions?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#16161a] border border-[#1e1e24]">
                    <h3 className="text-xs font-medium text-blue-400 mb-2 flex items-center gap-1"><Target className="h-3 w-3" /> CV Suggestions</h3>
                    <ul className="space-y-1">{aiResult.cv_suggestions.map((s: string, i: number) => <li key={i} className="text-sm text-[#a0a0ab]">• {s}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "cover" && (
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#1e1e24]">
                <p className="text-sm text-[#a0a0ab] whitespace-pre-wrap leading-relaxed">{aiResult.cover_letter || "No cover letter generated."}</p>
              </div>
            )}

            {activeTab === "followup" && (
              <div className="p-5 rounded-xl bg-[#16161a] border border-[#1e1e24]">
                <p className="text-sm text-[#a0a0ab] whitespace-pre-wrap leading-relaxed">{aiResult.follow_up_email || "No follow-up email generated."}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[#45454e] text-center py-8">Run an AI analysis to get match score, cover letter, and improvement suggestions</p>
        )}
      </div>
    </div>
  )
}
