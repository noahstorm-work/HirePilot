"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import type { InterviewQuestions } from "@/types"

interface Props {
  applicationId: string
  jobDescription: string
  cvText: string
}

export function InterviewCoach({ applicationId, jobDescription, cvText }: Props) {
  const [result, setResult] = useState<InterviewQuestions | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
  const [expandedBehavioral, setExpandedBehavioral] = useState<number | null>(null)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai/interview-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, jobDescription, cvText }),
      })
      const json = await res.json()
      if (json.success) setResult(json.data)
    } catch (err) { console.error("Interview coach error:", err) }
    setLoading(false)
  }

  if (!jobDescription || !cvText) {
    return (
      <div className="text-center py-8">
        <Sparkles className="mx-auto h-8 w-8 text-[var(--color-text-muted)] mb-3" />
        <p className="text-sm text-[var(--color-text-muted)]">Add a job description to generate interview prep.</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="text-center py-8">
        <Sparkles className="mx-auto h-8 w-8 text-violet-400 mb-3" />
        <p className="text-sm text-[var(--color-text-muted)] mb-4">Generate technical questions, behavioral questions, and company preparation.</p>
        <Button onClick={generate} disabled={loading} className="gradient-violet text-white border-0 hover:opacity-90">
          {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-1.5" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
          {loading ? "Generating..." : "Generate Interview Prep"}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="technical">
        <TabsList>
          <TabsTrigger value="technical">Technical Questions</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral (STAR)</TabsTrigger>
          <TabsTrigger value="company">Company Prep</TabsTrigger>
        </TabsList>

        <TabsContent value="technical" className="space-y-3">
          {result.technical?.map((q: { question: string; expected_areas?: string[]; sample_answer?: string }, i: number) => (
            <div key={i} className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
              <button onClick={() => setExpandedQuestion(expandedQuestion === i ? null : i)} className="flex items-start justify-between w-full text-left">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/10 text-xs text-violet-400 font-medium">{i + 1}</span>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{q.question}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 ml-7">
                    {q.expected_areas?.map((area: string, j: number) => (
                      <Badge key={j} variant="outline" className="text-[10px]">{area}</Badge>
                    ))}
                  </div>
                </div>
                {expandedQuestion === i ? <ChevronUp className="h-4 w-4 text-[var(--color-text-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />}
              </button>
              {expandedQuestion === i && q.sample_answer && (
                <div className="mt-3 ml-7 p-3 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]">
                  <p className="text-xs text-[var(--color-text-muted)] font-medium mb-1">Sample Answer:</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">{q.sample_answer}</p>
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="behavioral" className="space-y-3">
          {result.behavioral?.map((q: { question: string; type?: string; situation?: string; task?: string; action?: string; result?: string }, i: number) => (
            <div key={i} className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
              <button onClick={() => setExpandedBehavioral(expandedBehavioral === i ? null : i)} className="flex items-start justify-between w-full text-left">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-xs text-amber-400 font-medium">{i + 1}</span>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{q.question}</span>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)] ml-7">STAR: {q.type}</span>
                </div>
                {expandedBehavioral === i ? <ChevronUp className="h-4 w-4 text-[var(--color-text-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />}
              </button>
              {expandedBehavioral === i && (
                <div className="mt-3 ml-7 space-y-2">
                  {["situation", "task", "action", "result"].map((field) => (
                    <div key={field} className="p-2 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border-subtle)]">
                      <span className="text-xs font-medium text-[var(--color-text-muted)] capitalize">{field}:</span>
                      <p className="text-sm text-[var(--color-text-secondary)]">{(q as Record<string, unknown>)[field] as string}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="company">
          {result.company_preparation && (
            <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] space-y-4">
              <div>
                <h4 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Interview Format</h4>
                <p className="text-sm text-[var(--color-text-secondary)]">{result.company_preparation.common_interview_format}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Key Areas to Review</h4>
                <ul className="space-y-1">
                  {result.company_preparation.key_areas_to_review?.map((area: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Questions to Ask</h4>
                <ul className="space-y-1">
                  {result.company_preparation.questions_to_ask?.map((q: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
