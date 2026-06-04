"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SectionHeader } from "@/components/ui/section-header"
import { LoadingScreen } from "@/components/ui/loading-screen"
import {
  ArrowLeft, Brain, Sparkles, Target,
  Mail, MessageSquare, ExternalLink,
  CheckCircle2, AlertTriangle
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
        body: JSON.stringify({ application_id: app.id, job_url: app.job_url, job_description: app.notes || "", company: app.company, role: app.role_title }),
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

  if (loading) return <LoadingScreen />
  if (!app) return <div className="text-center py-16 text-xs text-[var(--color-text-muted)]">Application not found</div>

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link href="/applications" className="text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] flex items-center gap-1 mb-2 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to Applications
          </Link>
          <h1 className="text-xl font-bold font-[family-name:var(--font-display)] tracking-tight">{app.company}</h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{app.role_title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={app.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] focus:border-[var(--color-border-focus)]"
          >
            {["Saved", "Applied", "Interview", "Offer", "Rejected"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {app.job_url && (
            <a href={app.job_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] h-8 text-xs">
                <ExternalLink className="h-3 w-3 mr-1" /> View Job
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* AI Analysis */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="AI Job Analysis" icon={<Brain className="h-4 w-4 text-[var(--color-accent-violet)]" />} />
          {!aiResult && (
            <Button onClick={handleAnalyze} disabled={analyzing} size="sm" className="gradient-violet text-white border-0 hover:opacity-90 shadow-glow h-8 text-xs">
              {analyzing ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1.5" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
              {analyzing ? "Analyzing..." : "Run Analysis"}
            </Button>
          )}
        </div>

        {aiResult ? (
          <div className="space-y-4">
            {/* Match Score */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
              <div className="text-center">
                <p className="text-2xl font-bold font-[family-name:var(--font-display)] gradient-text-violet">{aiResult.match_score || 0}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">Match Score</p>
              </div>
              <div className="h-10 w-px bg-[var(--color-border-subtle)]" />
              <div className="flex-1">
                <p className="text-[10px] text-[var(--color-text-muted)] mb-1">Interview Probability</p>
                <p className="text-xs font-medium">{aiResult.match_score >= 80 ? "High" : aiResult.match_score >= 60 ? "Medium" : "Low"}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] overflow-x-auto w-full">
              {[
                { key: "analysis", label: "Analysis", icon: Target },
                { key: "cover", label: "Cover Letter", icon: Mail },
                { key: "followup", label: "Follow-up", icon: MessageSquare },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"}`}>
                  <tab.icon className="h-3 w-3" /> {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "analysis" && (
              <div className="space-y-3">
                {aiResult.strengths?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                    <h3 className="text-[11px] font-medium text-[var(--color-accent-emerald)] mb-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Strengths</h3>
                    <ul className="space-y-1">{aiResult.strengths.map((s: string, i: number) => <li key={i} className="text-xs text-[var(--color-text-secondary)]">• {s}</li>)}</ul>
                  </div>
                )}
                {aiResult.missing_skills?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                    <h3 className="text-[11px] font-medium text-[var(--color-accent-amber)] mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Missing Skills</h3>
                    <div className="flex flex-wrap gap-1.5">{aiResult.missing_skills.map((s: string, i: number) => <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)] border border-[var(--color-accent-amber)]/20">{s}</span>)}</div>
                  </div>
                )}
                {aiResult.cv_suggestions?.length > 0 && (
                  <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                    <h3 className="text-[11px] font-medium text-[var(--color-accent-blue)] mb-2 flex items-center gap-1"><Target className="h-3 w-3" /> CV Suggestions</h3>
                    <ul className="space-y-1">{aiResult.cv_suggestions.map((s: string, i: number) => <li key={i} className="text-xs text-[var(--color-text-secondary)]">• {s}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
            {activeTab === "cover" && (
              <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">{aiResult.cover_letter || "No cover letter generated."}</p>
              </div>
            )}
            {activeTab === "followup" && (
              <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">{aiResult.follow_up_email || "No follow-up email generated."}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-[var(--color-text-muted)]">Run an AI analysis to get match score, cover letter, and suggestions</p>
          </div>
        )}
      </div>
    </div>
  )
}
