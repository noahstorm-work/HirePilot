"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { ScoreRing } from "@/components/ui/score-ring"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { FileCheck, AlertTriangle, CheckCircle2, Target, Sparkles } from "lucide-react"

export default function ATSCheckerPage() {
  const [cvText, setCvText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleCheck = async () => {
    if (!cvText.trim()) return
    setLoading(true)
    setError("")
    try {
      const plainText = cvText.replace(/<[^>]*>/g, "").trim()
      const res = await fetch("/api/ai/cv-improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_text: plainText, job_description: jobDescription }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setResult(json.data)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="ATS Checker"
        description="Scan your CV against ATS systems and get optimization tips"
        icon={<FileCheck className="h-4 w-4 text-[var(--color-accent-cyan)]" />}
      />

      {/* Input */}
      <div className="surface-card p-5 space-y-3.5">
        <div>
          <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] mb-2 block">CV / Resume Text</Label>
          <RichTextEditor
            value={cvText}
            onChange={setCvText}
            placeholder="Paste your CV text here..."
          />
        </div>
        <div>
          <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Target Job Description (optional)</Label>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] min-h-[80px] text-sm"
            placeholder="Paste job description for targeted ATS analysis..."
          />
        </div>
        <Button onClick={handleCheck} disabled={loading || !cvText.trim()} className="gradient-violet text-white border-0 px-6 h-9 text-sm font-semibold hover:opacity-90 shadow-glow group">
          {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : (
            <><FileCheck className="h-3.5 w-3.5 mr-1.5" /> Check ATS Compatibility</>
          )}
        </Button>
      </div>

      {error && <div className="p-2.5 rounded-lg bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20"><p className="text-[11px] text-[var(--color-accent-rose)]">{error}</p></div>}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          <div className="surface-card p-6 flex flex-col items-center">
            <ScoreRing score={75} size="lg" label="ATS Compatibility" />
            <p className="text-xs text-[var(--color-text-secondary)] mt-3 max-w-sm text-center">
              {result.keyword_additions?.length > 5 ? "Your CV needs significant improvements to pass ATS screening." :
               result.keyword_additions?.length > 2 ? "Your CV could use some improvements for better ATS compatibility." :
               "Your CV has good ATS compatibility with minimal changes needed."}
            </p>
          </div>

          {result.improved_cv_sections && (
            <div className="space-y-3">
              {result.improved_cv_sections.summary && (
                <div className="surface-card p-5">
                  <SectionHeader title="Improved Summary" icon={<CheckCircle2 className="h-4 w-4 text-[var(--color-accent-emerald)]" />} />
                  <p className="text-xs text-[var(--color-text-secondary)] mt-3 whitespace-pre-wrap leading-relaxed">{result.improved_cv_sections.summary}</p>
                </div>
              )}
              {result.improved_cv_sections.experience?.length > 0 && (
                <div className="surface-card p-5">
                  <SectionHeader title="Improved Experience" icon={<Target className="h-4 w-4 text-[var(--color-accent-blue)]" />} />
                  <div className="space-y-2 mt-3">
                    {result.improved_cv_sections.experience.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-accent-emerald)] shrink-0 mt-0.5" />
                        <span className="text-xs text-[var(--color-text-secondary)]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {result.sections_to_remove?.length > 0 && (
            <div className="surface-card p-5">
              <SectionHeader title="Sections to Remove" icon={<AlertTriangle className="h-4 w-4 text-[var(--color-accent-amber)]" />} />
              <div className="space-y-2 mt-3">
                {result.sections_to_remove.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                    <AlertTriangle className="h-3.5 w-3.5 text-[var(--color-accent-amber)] shrink-0 mt-0.5" />
                    <span className="text-xs text-[var(--color-text-secondary)]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.keyword_additions?.length > 0 && (
            <div className="surface-card p-5">
              <SectionHeader title="Keywords to Add" icon={<Target className="h-4 w-4 text-[var(--color-accent-emerald)]" />} />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {result.keyword_additions.map((k: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-[10px] bg-[var(--color-accent-emerald)]/10 text-[var(--color-accent-emerald)] border border-[var(--color-accent-emerald)]/20">{k}</span>
                ))}
              </div>
            </div>
          )}

          {result.estimated_match_improvement && (
            <div className="surface-card p-5">
              <SectionHeader title="Estimated Improvement" icon={<CheckCircle2 className="h-4 w-4 text-[var(--color-accent-violet)]" />} />
              <p className="text-xs text-[var(--color-text-secondary)] mt-3">{result.estimated_match_improvement}</p>
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <EmptyState
          icon={FileCheck}
          title="ATS Compatibility Checker"
          description="Paste your CV and optionally a job description to check how well your resume passes Applicant Tracking Systems."
        />
      )}
    </div>
  )
}
