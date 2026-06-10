"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionHeader } from "@/components/ui/section-header"
import { LoadingScreen } from "@/components/ui/loading-screen"
import {
  ArrowLeft, Brain, Sparkles, Target,
  Mail, MessageSquare, ExternalLink,
  CheckCircle2, AlertTriangle, Ban, Send, Loader2
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import type { Application, AiResult, RejectionAnalysis } from "@/types"
import { APPLICATION_STATUSES } from "@/lib/constants"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [app, setApp] = useState<Application | null>(null)
  const [aiResult, setAiResult] = useState<AiResult | null>(null)
  const [rejectionResult, setRejectionResult] = useState<RejectionAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [generatingFollowup, setGeneratingFollowup] = useState(false)
  const [analyzingRejection, setAnalyzingRejection] = useState(false)
  const [activeTab, setActiveTab] = useState<"analysis" | "cover" | "followup" | "rejection">("analysis")
  const supabase = createClient()

  const loadApplication = async () => {
    const { data } = await supabase.from("applications").select("*").eq("id", params.id).maybeSingle()
    if (data) {
      setApp(data)
      const { data: ai } = await supabase.from("ai_results").select("*").eq("application_id", params.id).maybeSingle()
      if (ai) setAiResult(ai)
      if (data.status === "Rejected") {
        const { data: rej } = await supabase.from("rejection_analyses").select("*").eq("application_id", params.id).maybeSingle()
        if (rej) setRejectionResult(rej)
      }
    }
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadApplication() }, [params.id])

  const handleAnalyze = async () => {
    if (!app) return
    setAnalyzing(true)
    try {
      const res = await fetch("/api/ai/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: app.id, job_description: app.job_description || app.notes || "", company: app.company, role_title: app.role_title }),
      })
      const json = await res.json()
      if (json.success) { setAiResult(json.data); toast.success("Analysis complete") }
      else { toast.error(json.error || "Analysis failed") }
    } catch { toast.error("Analysis failed") }
    setAnalyzing(false)
  }

  const handleGenerateFollowup = async () => {
    if (!app) return
    setGeneratingFollowup(true)
    try {
      const created = new Date(app.created_at)
      const daysSince = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24))
      const res = await fetch("/api/ai/generate-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: app.id, company: app.company, role_title: app.role_title, days_since: daysSince }),
      })
      const json = await res.json()
      if (json.success) {
        const updated = { ...aiResult!, follow_up_email: json.data.body }
        setAiResult(updated)
        await supabase.from("ai_results").upsert({
          application_id: app.id,
          follow_up_email: json.data.body,
        }, { onConflict: "application_id" })
        toast.success("Follow-up email generated")
        setActiveTab("followup")
      } else {
        toast.error(json.error || "Failed to generate")
      }
    } catch { toast.error("Failed to generate follow-up") }
    setGeneratingFollowup(false)
  }

  const handleAnalyzeRejection = async () => {
    if (!app) return
    setAnalyzingRejection(true)
    try {
      const res = await fetch("/api/ai/rejection-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: app.id, jobDescription: app.job_description || "" }),
      })
      const json = await res.json()
      if (json.success) {
        setRejectionResult(json.data)
        toast.success("Rejection analysis complete")
        setActiveTab("rejection")
      } else {
        toast.error(json.error || "Analysis failed")
      }
    } catch { toast.error("Rejection analysis failed") }
    setAnalyzingRejection(false)
  }

  const handleStatusChange = async (status: string) => {
    if (!app) return
    const { error } = await supabase.from("applications").update({ status: status as Application["status"] }).eq("id", app.id)
    if (error) { toast.error("Failed to update status"); return }
    setApp({ ...app, status: status as Application["status"] })
    if (status === "Rejected" && !rejectionResult) {
      const { data: rej } = await supabase.from("rejection_analyses").select("*").eq("application_id", params.id).maybeSingle()
      if (rej) setRejectionResult(rej)
    }
    toast.success(`Status changed to ${status}`)
  }

  if (loading) return <LoadingScreen />
  if (!app) return <div className="text-center py-16 text-xs text-[var(--color-text-muted)]">Application not found</div>

  const isRejected = app.status === "Rejected"

  const tabs = [
    { key: "analysis" as const, label: "Analysis", icon: Target },
    { key: "cover" as const, label: "Cover Letter", icon: Mail },
    { key: "followup" as const, label: "Follow-up", icon: MessageSquare },
    ...(isRejected ? [{ key: "rejection" as const, label: "Rejection Analysis", icon: Ban }] : []),
  ]

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
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {app.status === "Interview" && (
            <Link href={`/interview-prep/${app.id}`}>
              <Button variant="outline" size="sm" className="border-[var(--color-accent-violet)]/30 text-[var(--color-accent-violet)] hover:bg-[var(--color-accent-violet)]/10 h-8 text-xs">
                <Sparkles className="h-3 w-3 mr-1" /> Interview Prep
              </Button>
            </Link>
          )}
          <Select value={app.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-8 px-2.5 py-1.5 text-[11px] w-auto min-w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPLICATION_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <div className="flex items-center gap-2">
            {isRejected && !rejectionResult && (
              <Button onClick={handleAnalyzeRejection} disabled={analyzingRejection} size="sm" variant="outline" className="border-[var(--color-accent-rose)]/30 text-[var(--color-accent-rose)] hover:bg-[var(--color-accent-rose)]/10 h-8 text-xs">
                {analyzingRejection ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Ban className="h-3 w-3 mr-1.5" />}
                {analyzingRejection ? "Analyzing..." : "Analyze Rejection"}
              </Button>
            )}
            {!aiResult && (
              <Button onClick={handleAnalyze} disabled={analyzing} size="sm" className="gradient-violet text-white border-0 hover:opacity-90 shadow-glow h-8 text-xs">
                {analyzing ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
                {analyzing ? "Analyzing..." : "Run Analysis"}
              </Button>
            )}
          </div>
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
            <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] overflow-x-auto w-full" role="tablist">
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} role="tab" aria-selected={activeTab === tab.key} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"}`}>
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
              <div className="space-y-3">
                {aiResult.follow_up_email ? (
                  <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                    <p className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed">{aiResult.follow_up_email}</p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">No follow-up email generated yet</p>
                    <Button onClick={handleGenerateFollowup} disabled={generatingFollowup} size="sm" className="gradient-violet text-white border-0 hover:opacity-90 h-8 text-xs">
                      {generatingFollowup ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Send className="h-3 w-3 mr-1.5" />}
                      {generatingFollowup ? "Generating..." : "Generate Follow-up Email"}
                    </Button>
                  </div>
                )}
              </div>
            )}
            {activeTab === "rejection" && isRejected && (
              <div className="space-y-3">
                {rejectionResult ? (
                  <>
                    {rejectionResult.likely_reasons?.length > 0 && (
                      <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                        <h3 className="text-[11px] font-medium text-[var(--color-accent-rose)] mb-2 flex items-center gap-1"><Ban className="h-3 w-3" /> Likely Reasons</h3>
                        <ul className="space-y-1">{rejectionResult.likely_reasons.map((s: string, i: number) => <li key={i} className="text-xs text-[var(--color-text-secondary)]">• {s}</li>)}</ul>
                      </div>
                    )}
                    {rejectionResult.skills_gaps?.length > 0 && (
                      <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                        <h3 className="text-[11px] font-medium text-[var(--color-accent-amber)] mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Skills Gaps</h3>
                        <div className="flex flex-wrap gap-1.5">{rejectionResult.skills_gaps.map((s: string, i: number) => <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)] border border-[var(--color-accent-amber)]/20">{s}</span>)}</div>
                      </div>
                    )}
                    {rejectionResult.cv_weaknesses?.length > 0 && (
                      <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                        <h3 className="text-[11px] font-medium text-[var(--color-accent-blue)] mb-2 flex items-center gap-1"><Target className="h-3 w-3" /> CV Weaknesses</h3>
                        <ul className="space-y-1">{rejectionResult.cv_weaknesses.map((s: string, i: number) => <li key={i} className="text-xs text-[var(--color-text-secondary)]">• {s}</li>)}</ul>
                      </div>
                    )}
                    {rejectionResult.improvement_plan?.length > 0 && (
                      <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                        <h3 className="text-[11px] font-medium text-[var(--color-accent-emerald)] mb-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Improvement Plan</h3>
                        <div className="space-y-2">{rejectionResult.improvement_plan.map((item: { priority: string; action: string }, i: number) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${item.priority === "high" ? "bg-[var(--color-accent-rose)]/10 text-[var(--color-accent-rose)]" : item.priority === "medium" ? "bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)]" : "bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]"}`}>{item.priority}</span>
                            <span className="text-xs text-[var(--color-text-secondary)]">{item.action}</span>
                          </div>
                        ))}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-[var(--color-text-muted)] mb-3">Analyze this rejection to get insights and improvement plans</p>
                    <Button onClick={handleAnalyzeRejection} disabled={analyzingRejection} size="sm" className="gradient-violet text-white border-0 hover:opacity-90 h-8 text-xs">
                      {analyzingRejection ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Ban className="h-3 w-3 mr-1.5" />}
                      {analyzingRejection ? "Analyzing..." : "Analyze Rejection"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <EmptyState icon={Brain} title="AI Job Analysis" description="Run an AI analysis to get match score, cover letter, and suggestions" />
        )}
      </div>
    </div>
  )
}
