"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor, getEditorPlainText } from "@/components/ui/rich-text-editor"
import {
  Brain, Sparkles, Target, TrendingUp, BarChart3,
  Briefcase, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle
} from "lucide-react"

export default function CareerAnalysisPage() {
  const [cvText, setCvText] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const supabase = createClient()

  const handleAnalyze = async () => {
    if (!getEditorPlainText(cvText).trim()) return
    setLoading(true)
    setError("")

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const res = await fetch("/api/ai/career-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv_text: getEditorPlainText(cvText),
          linkedin_url: linkedinUrl,
          github_url: githubUrl,
          portfolio_url: portfolioUrl,
          target_role: targetRole,
        }),
      })

      const json = await res.json()
      if (!json.success) throw new Error(json.error || "Analysis failed")
      setResult(json.data)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    }
    setLoading(false)
  }

  const score = result?.interview_readiness_score || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">Career Analysis</h1>
        <p className="text-sm text-[#63636e] mt-1">Get your Interview Readiness Score and personalized improvement plan</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border border-[#1e1e24] bg-[#0f0f12]">
            <h2 className="text-sm font-medium text-[#a0a0ab] mb-4 flex items-center gap-2">
              <Brain className="h-4 w-4 text-violet-400" />
              Your Career Profile
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-[#63636e] mb-1.5 block">CV / Resume Text *</Label>
                <RichTextEditor
                  value={cvText}
                  onChange={setCvText}
                  placeholder="Paste your CV or resume text here..."
                  className="min-h-[200px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-[#63636e] mb-1.5 block">LinkedIn URL</Label>
                  <Input
                    placeholder="https://linkedin.com/in/..."
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e] focus:border-violet-500 focus:ring-violet-500/20"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-[#63636e] mb-1.5 block">GitHub URL</Label>
                  <Input
                    placeholder="https://github.com/..."
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e] focus:border-violet-500 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-[#63636e] mb-1.5 block">Portfolio URL</Label>
                  <Input
                    placeholder="https://yoursite.com"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e] focus:border-violet-500 focus:ring-violet-500/20"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-[#63636e] mb-1.5 block">Target Role</Label>
                  <Input
                    placeholder="e.g. Senior Frontend Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e] focus:border-violet-500 focus:ring-violet-500/20"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <p className="text-xs text-rose-400">{error}</p>
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={loading || !getEditorPlainText(cvText).trim()}
                className="w-full gradient-violet text-white border-0 h-11 font-semibold hover:opacity-90 group"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Analyzing your career...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Run Career Analysis
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="inline-flex p-4 rounded-2xl bg-[#16161a] border border-[#1e1e24] mb-4">
                <Brain className="h-8 w-8 text-[#45454e]" />
              </div>
              <p className="text-sm text-[#63636e] max-w-xs">
                Paste your CV and run the analysis to see your Interview Readiness Score and improvement plan
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-violet-400" />
                </div>
              </div>
              <p className="text-sm text-[#a0a0ab] mt-4">AI is analyzing your career profile...</p>
              <p className="text-xs text-[#45454e] mt-1">This usually takes 15-30 seconds</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 animate-fade-in">
              {/* Score Hero */}
              <div className="relative p-6 rounded-2xl border border-[#1e1e24] bg-[#0f0f12] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-blue-600/5" />
                <div className="relative flex items-center gap-6">
                  <svg className="w-28 h-28 shrink-0 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" stroke="#1e1e24" strokeWidth="8" fill="none" />
                    <circle cx="60" cy="60" r="52" stroke="url(#analysisGradient)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${score * 3.27} ${100 * 3.27}`} />
                    <defs>
                      <linearGradient id="analysisGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute left-[52px] top-1/2 -translate-y-1/2 flex flex-col items-center">
                    <span className="text-3xl font-bold font-[family-name:var(--font-display)]">{score}</span>
                    <span className="text-xs text-[#63636e]">/ 100</span>
                  </div>
                  <div>
                    <p className="text-xs text-[#63636e] uppercase tracking-wider mb-1">Interview Readiness Score</p>
                    <p className="text-lg font-semibold font-[family-name:var(--font-display)]">
                      {score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs Work" : "Critical"}
                    </p>
                    <p className="text-xs text-[#63636e] mt-1">Target: 90/100</p>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "CV Score", value: result.cv_score },
                  { label: "LinkedIn", value: result.linkedin_score },
                  { label: "Portfolio", value: result.portfolio_score },
                ].map((s) => (
                  <div key={s.label} className="p-4 rounded-xl border border-[#1e1e24] bg-[#0f0f12] text-center">
                    <p className="text-xs text-[#63636e] mb-1">{s.label}</p>
                    <p className="text-xl font-bold font-[family-name:var(--font-display)]">{s.value || 0}</p>
                  </div>
                ))}
              </div>

              {/* Missing Skills */}
              {result.missing_skills?.length > 0 && (
                <div className="p-5 rounded-xl border border-[#1e1e24] bg-[#0f0f12]">
                  <h3 className="text-sm font-medium text-[#a0a0ab] mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missing_skills.map((skill: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Improvements */}
              {result.top_improvements?.length > 0 && (
                <div className="p-5 rounded-xl border border-[#1e1e24] bg-[#0f0f12]">
                  <h3 className="text-sm font-medium text-[#a0a0ab] mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Top Improvements
                  </h3>
                  <div className="space-y-2">
                    {result.top_improvements.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#16161a]">
                        <span className="text-sm font-bold font-[family-name:var(--font-mono)] text-emerald-400">
                          +{item.impact || item.points || 3}
                        </span>
                        <div className="h-px w-6 bg-[#27272f]" />
                        <span className="text-sm text-[#a0a0ab]">{item.action || item.improvement || item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => { setResult(null); setCvText("") }}
                variant="outline"
                className="w-full border-[#27272f] text-[#a0a0ab] hover:text-[#fafafa] hover:bg-[#16161a]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Another Analysis
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
