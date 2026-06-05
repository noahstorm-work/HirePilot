"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Sparkles, Code, MessageSquare, Building2, CheckCircle2 } from "lucide-react"

export default function InterviewCoachPage() {
  const [company, setCompany] = useState("")
  const [role, setRole] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"technical" | "behavioral" | "star" | "company">("technical")
  const supabase = createClient()

  const handleGenerate = async () => {
    if (!role.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/ai/interview-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, company, job_description: jobDescription }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setResult(json.data)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const tabs = [
    { key: "technical", label: "Technical", icon: Code },
    { key: "behavioral", label: "Behavioral", icon: MessageSquare },
    { key: "star", label: "STAR Method", icon: CheckCircle2 },
    { key: "company", label: "Company Prep", icon: Building2 },
  ] as const

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Interview Coach"
        description="Generate tailored questions and preparation strategies"
        icon={<Sparkles className="h-4 w-4 text-[var(--color-accent-emerald)]" />}
      />

      {/* Input */}
      <div className="surface-card p-5 space-y-3.5">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Role *</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="e.g. Senior Frontend Engineer" />
          </div>
          <div>
            <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="e.g. Google" />
          </div>
          <div className="flex items-end">
            <Button onClick={handleGenerate} disabled={loading || !role.trim()} className="w-full gradient-violet text-white border-0 hover:opacity-90 shadow-glow h-9 text-sm">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Sparkles className="h-3.5 w-3.5 mr-1.5" /> Generate</>}
            </Button>
          </div>
        </div>
        <div>
          <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Job Description (optional)</Label>
          <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] min-h-[70px] resize-none text-sm" placeholder="Paste job description for more tailored questions..." />
        </div>
      </div>

      {error && <div className="p-2.5 rounded-lg bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20"><p className="text-[11px] text-[var(--color-accent-rose)]">{error}</p></div>}

      {result && (
        <div className="animate-fade-in">
          <div className="flex gap-1 p-0.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] mb-5 overflow-x-auto w-full">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? "bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"}`}>
                <tab.icon className="h-3 w-3" /> {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-2.5">
            {activeTab === "technical" && (result.technical_questions || []).map((q: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
                <div className="flex items-start gap-2.5">
                  <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent-violet)] mt-0.5">Q{i + 1}</span>
                  <div>
                    <p className="text-xs font-medium">{typeof q === "string" ? q : q.question}</p>
                    {typeof q === "object" && q.hint && <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5">Hint: {q.hint}</p>}
                  </div>
                </div>
              </div>
            ))}
            {activeTab === "behavioral" && (result.behavioral_questions || []).map((q: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
                <div className="flex items-start gap-2.5">
                  <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent-blue)] mt-0.5">Q{i + 1}</span>
                  <div>
                    <p className="text-xs font-medium">{typeof q === "string" ? q : q.question}</p>
                    {typeof q === "object" && q.framework && <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5">Framework: {q.framework}</p>}
                  </div>
                </div>
              </div>
            ))}
            {activeTab === "star" && (result.behavioral_questions || []).map((q: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
                <p className="text-xs font-medium mb-2.5 text-[var(--color-accent-emerald)]">{q.question || `Example ${i + 1}`}</p>
                <div className="space-y-1.5 text-[11px] text-[var(--color-text-secondary)]">
                  {q.situation && <p><span className="text-[var(--color-text-muted)] font-medium">Situation:</span> {q.situation}</p>}
                  {q.task && <p><span className="text-[var(--color-text-muted)] font-medium">Task:</span> {q.task}</p>}
                  {q.action && <p><span className="text-[var(--color-text-muted)] font-medium">Action:</span> {q.action}</p>}
                  {q.result && <p><span className="text-[var(--color-text-muted)] font-medium">Result:</span> {q.result}</p>}
                </div>
              </div>
            ))}
            {activeTab === "company" && result.company_preparation && (
              <div className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] space-y-3">
                {result.company_preparation.common_interview_format && (
                  <div>
                    <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Interview Format</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{result.company_preparation.common_interview_format}</p>
                  </div>
                )}
                {result.company_preparation.key_areas_to_review?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Key Areas to Review</p>
                    <ul className="space-y-1">{result.company_preparation.key_areas_to_review.map((area: string, i: number) => <li key={i} className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]"><span className="h-1 w-1 rounded-full bg-[var(--color-accent-violet)]" />{area}</li>)}</ul>
                  </div>
                )}
                {result.company_preparation.questions_to_ask?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Questions to Ask</p>
                    <ul className="space-y-1">{result.company_preparation.questions_to_ask.map((q: string, i: number) => <li key={i} className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]"><span className="h-1 w-1 rounded-full bg-[var(--color-accent-amber)]" />{q}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
            {activeTab === "company" && !result.company_preparation && (
              <div className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
                <p className="text-xs text-[var(--color-text-muted)]">Enter a company name to get company-specific interview preparation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!result && !loading && (
        <EmptyState
          icon={Sparkles}
          title="Interview Coach"
          description="Enter a role and generate AI-powered interview preparation with technical questions, STAR responses, and company research."
        />
      )}
    </div>
  )
}
