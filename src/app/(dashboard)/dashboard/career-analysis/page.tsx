"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScoreRing } from "@/components/ui/score-ring"
import { SectionHeader } from "@/components/ui/section-header"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { DocumentUpload } from "@/components/ui/document-upload"
import { Brain, Sparkles, Target, TrendingUp, BarChart3, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import type { CareerAnalysis, Improvement, WeeklyPlan } from "@/types"

export default function CareerAnalysisPage() {
  const [cvText, setCvText] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [result, setResult] = useState<CareerAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle()
    if (data) {
      setCvText(data.cv_text || "")
      setLinkedinUrl(data.linkedin_url || "")
      setGithubUrl(data.github_url || "")
      setPortfolioUrl(data.portfolio_url || "")
      setTargetRole(data.target_role || "")
    }
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setError("")
    try {
      const plainText = cvText.replace(/<[^>]*>/g, "").trim()
      const res = await fetch("/api/ai/career-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_text: plainText, linkedin_url: linkedinUrl, github_url: githubUrl, portfolio_url: portfolioUrl, target_role: targetRole }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setResult(json.data)
      toast.success("Analysis complete")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed"
      setError(message)
      toast.error(message)
    }
    setLoading(false)
  }

  const score = result?.interview_readiness_score || 0

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Career Analysis"
        description="AI-powered analysis of your career readiness"
        icon={<Brain className="h-4 w-4 text-[var(--color-accent-violet)]" />}
      />

      {/* Input */}
      <div className="surface-card p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)]">CV / Resume</Label>
            <DocumentUpload onTextExtracted={(text) => setCvText(text.replace(/\n/g, "<br>"))} label="Upload CV" />
          </div>
          <RichTextEditor value={cvText} onChange={setCvText} placeholder="Paste your CV text here..." />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">LinkedIn URL</Label>
            <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">GitHub URL</Label>
            <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="https://github.com/..." />
          </div>
          <div>
            <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Portfolio URL</Label>
            <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="https://..." />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Target Role</Label>
            <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="e.g. Senior Frontend Engineer" />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAnalyze} disabled={loading || !cvText.trim()} className="gradient-violet text-white border-0 px-6 h-9 text-sm font-semibold hover:opacity-90 shadow-glow group">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  Analyze Career
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {error && <div className="p-2.5 rounded-lg bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20"><p className="text-[11px] text-[var(--color-accent-rose)]">{error}</p></div>}

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-fade-in">
          {/* Score Overview */}
          <div className="surface-card p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <ScoreRing score={score} size="xl" label="Interview Readiness" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: "CV Score", value: result.cv_score || 0, icon: Target, color: "text-[var(--color-accent-violet)]" },
                { label: "LinkedIn", value: result.linkedin_score || 0, icon: TrendingUp, color: "text-[var(--color-accent-blue)]" },
                { label: "Portfolio", value: result.portfolio_score || 0, icon: BarChart3, color: "text-[var(--color-accent-emerald)]" },
                { label: "Market Fit", value: result.market_competitiveness_score || 0, icon: Brain, color: "text-[var(--color-accent-amber)]" },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-center">
                  <item.icon className={`h-3.5 w-3.5 ${item.color} mx-auto mb-1.5`} />
                  <p className="text-lg font-bold font-[family-name:var(--font-display)]">{item.value}</p>
                  <p className="text-[9px] text-[var(--color-text-muted)]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Gap */}
          {result.missing_technologies?.length > 0 && (
            <div className="surface-card p-5">
              <SectionHeader title="Missing Technologies" icon={<Target className="h-4 w-4 text-[var(--color-accent-amber)]" />} />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {result.missing_technologies.map((t: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-[10px] bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)] border border-[var(--color-accent-amber)]/20">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Top Improvements */}
          {result.top_improvements?.length > 0 && (
            <div className="surface-card p-5">
              <SectionHeader title="Top Improvements" icon={<TrendingUp className="h-4 w-4 text-[var(--color-accent-emerald)]" />} />
              <div className="space-y-2 mt-3">
                {result.top_improvements.map((item: Improvement, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                    <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent-emerald)] shrink-0">+{item.impact || 3}</span>
                    <div className="h-px w-6 bg-[var(--color-border-subtle)] shrink-0" />
                    <span className="text-xs text-[var(--color-text-secondary)]">{item.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 30-Day Plan */}
          {result.thirty_day_plan && (
            <div className="surface-card p-5">
              <SectionHeader title="30-Day Career Roadmap" icon={<Sparkles className="h-4 w-4 text-[var(--color-accent-violet)]" />} />
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
                {(Array.isArray(result.thirty_day_plan) ? result.thirty_day_plan : []).slice(0, 4).map((week: WeeklyPlan, i: number) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                    <p className="text-[10px] font-semibold text-[var(--color-accent-violet)] mb-1">Week {i + 1}</p>
                    <p className="text-xs font-medium mb-1">{week.title || `Week ${i + 1}`}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed">{week.description || JSON.stringify(week)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
