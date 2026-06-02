"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles, Target, FileText, MessageSquare, Lightbulb,
  Loader2, Copy, Check, BookOpen,
} from "lucide-react"
import type { ApplicationStatus } from "@/types"

interface Props {
  applicationId: string
  status: ApplicationStatus
  jobDescription: string
  cvText: string
  existingAnalysis: any | null
  existingRejection: any | null
}

export function ApplicationWorkspace({
  applicationId, status, jobDescription, cvText,
  existingAnalysis, existingRejection,
}: Props) {
  const [analysis, setAnalysis] = useState<any>(existingAnalysis)
  const [rejection, setRejection] = useState<any>(existingRejection)
  const [loading, setLoading] = useState(false)
  const [followUp, setFollowUp] = useState<{ subject: string; body: string } | null>(null)
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const runAnalysis = async () => {
    if (!jobDescription || !cvText) return
    setLoading(true)
    try {
      const res = await fetch("/api/ai/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, jobDescription, cvText }),
      })
      const json = await res.json()
      if (json.success) setAnalysis(json.data)
    } catch {}
    setLoading(false)
  }

  const generateFollowUp = async () => {
    setFollowUpLoading(true)
    try {
      const { data: app } = await supabase
        .from("applications")
        .select("company, role_title, created_at")
        .eq("id", applicationId)
        .single()

      if (!app) return

      const daysSince = Math.floor(
        (Date.now() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24),
      )

      const res = await fetch("/api/ai/generate-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, company: app.company, roleTitle: app.role_title, daysSince }),
      })
      const json = await res.json()
      if (json.success) setFollowUp(json.data)
    } catch {}
    setFollowUpLoading(false)
  }

  const runRejectionAnalysis = async () => {
    if (!jobDescription || !cvText) return
    setLoading(true)
    try {
      const res = await fetch("/api/ai/rejection-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, jobDescription, cvText }),
      })
      const json = await res.json()
      if (json.success) setRejection(json.data)
    } catch {}
    setLoading(false)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const needsInput = !jobDescription || !cvText
  const hasAnalysis = !!analysis
  const showRejection = status === "Rejected"

  return (
    <div className="space-y-4">
      {needsInput && (
        <div className="text-center py-8">
          <Sparkles className="mx-auto h-8 w-8 text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">
            Add a job description and CV to enable AI analysis.
          </p>
        </div>
      )}

      {!needsInput && !hasAnalysis && !showRejection && (
        <div className="text-center py-8">
          <Sparkles className="mx-auto h-8 w-8 text-violet-500 mb-3" />
          <p className="text-sm text-gray-500 mb-4">Ready to analyze this application.</p>
          <Button onClick={runAnalysis} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Target className="h-4 w-4 mr-1.5" />}
            {loading ? "Analyzing..." : "Run AI Analysis"}
          </Button>
        </div>
      )}

      {hasAnalysis && (
        <Tabs defaultValue="overview">
          <TabsList className="w-full flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cv">CV Suggestions</TabsTrigger>
            <TabsTrigger value="cover">Cover Letter</TabsTrigger>
            <TabsTrigger value="followup">Follow-up</TabsTrigger>
            <TabsTrigger value="interview">Interview Prep</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-violet-50">
                <Target className="h-8 w-8 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Match Score</p>
                <p className="text-3xl font-bold text-gray-900">{analysis.match_score}%</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {analysis.strengths?.map((s: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Missing Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missing_skills?.map((s: string, i: number) => (
                      <Badge key={i} variant="destructive">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={runAnalysis} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Re-analyze
              </Button>
              {status === "Interview" && (
                <Button size="sm" onClick={() => router.push(`/interview-prep/${applicationId}`)}>
                  <BookOpen className="h-4 w-4 mr-1" />
                  Interview Coach
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="cv">
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {analysis.cv_suggestions?.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs text-violet-600 font-medium">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cover">
            <Card>
              <CardContent className="pt-6">
                {analysis.cover_letter ? (
                  <div>
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(analysis.cover_letter)}
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {analysis.cover_letter}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No cover letter generated yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followup">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {followUp ? (
                  <div>
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`Subject: ${followUp.subject}\n\n${followUp.body}`)}
                      >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 mb-3">
                      <span className="text-xs font-medium text-gray-500">Subject:</span>
                      <p className="text-sm text-gray-900">{followUp.subject}</p>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                      {followUp.body}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <MessageSquare className="mx-auto h-6 w-6 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500 mb-3">
                      Generate a professional follow-up email.
                    </p>
                    <Button onClick={generateFollowUp} disabled={followUpLoading} size="sm">
                      {followUpLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <MessageSquare className="h-4 w-4 mr-1" />}
                      Generate Follow-up
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interview">
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="mx-auto h-6 w-6 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 mb-3">
                  Get technical questions, STAR answers, and company preparation.
                </p>
                <Button onClick={() => router.push(`/interview-prep/${applicationId}`)}>
                  <BookOpen className="h-4 w-4 mr-1" />
                  Go to Interview Coach
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {showRejection && (
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-red-500" />
              Rejection Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rejection ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Likely Reasons</h4>
                  <ul className="space-y-1">
                    {rejection.likely_reasons?.map((r: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Skill Gaps</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {rejection.skills_gaps?.map((g: string, i: number) => (
                        <Badge key={i} variant="destructive">{g}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">CV Weaknesses</h4>
                    <ul className="space-y-1">
                      {rejection.cv_weaknesses?.map((w: string, i: number) => (
                        <li key={i} className="text-sm text-gray-700">• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {rejection.market_competition_note && (
                  <div className="p-3 rounded-lg bg-amber-50 text-sm text-amber-800">
                    {rejection.market_competition_note}
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Improvement Plan</h4>
                  <div className="space-y-2">
                    {rejection.improvement_plan?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Badge variant={item.priority === "high" ? "destructive" : item.priority === "medium" ? "warning" : "primary"}>
                          {item.priority}
                        </Badge>
                        <span className="text-gray-700">{item.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Sparkles className="mx-auto h-6 w-6 text-gray-300 mb-2" />
                <p className="text-sm text-gray-500 mb-3">
                  Analyze why this application was rejected and get improvement recommendations.
                </p>
                <Button onClick={runRejectionAnalysis} disabled={loading} variant="outline">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Lightbulb className="h-4 w-4 mr-1" />}
                  Analyze Rejection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
