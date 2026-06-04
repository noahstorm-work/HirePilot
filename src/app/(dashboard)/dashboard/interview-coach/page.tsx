"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Sparkles, Brain, Code, MessageSquare, Building2,
  CheckCircle2, ArrowRight, RefreshCw
} from "lucide-react"

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">Interview Coach</h1>
        <p className="text-sm text-[#63636e] mt-1">Generate tailored interview questions and preparation strategies</p>
      </div>

      {/* Input */}
      <div className="p-6 rounded-2xl border border-[#1e1e24] bg-[#0f0f12]">
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label className="text-xs text-[#63636e] mb-1.5 block">Role *</Label>
            <Input value={role} onChange={(e) => setRole(e.target.value)} className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] focus:border-violet-500" placeholder="e.g. Senior Frontend Engineer" />
          </div>
          <div>
            <Label className="text-xs text-[#63636e] mb-1.5 block">Company</Label>
            <Input value={company} onChange={(e) => setCompany(e.target.value)} className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] focus:border-violet-500" placeholder="e.g. Google" />
          </div>
          <div className="flex items-end">
            <Button onClick={handleGenerate} disabled={loading || !role.trim()} className="w-full gradient-violet text-white border-0 hover:opacity-90">
              {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Prep</>}
            </Button>
          </div>
        </div>
        <div>
          <Label className="text-xs text-[#63636e] mb-1.5 block">Job Description (optional)</Label>
          <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] focus:border-violet-500 min-h-[80px] resize-none" placeholder="Paste the job description for more tailored questions..." />
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20"><p className="text-xs text-rose-400">{error}</p></div>}

      {/* Results */}
      {result && (
        <div className="animate-fade-in">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-[#0f0f12] border border-[#1e1e24] mb-6 overflow-x-auto w-full">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.key ? "bg-violet-500/10 text-violet-400 font-medium" : "text-[#63636e] hover:text-[#a0a0ab]"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-3">
            {activeTab === "technical" && (result.technical_questions || []).map((q: any, i: number) => (
              <div key={i} className="p-5 rounded-xl border border-[#1e1e24] bg-[#0f0f12]">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-violet-400 mt-0.5">Q{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{typeof q === "string" ? q : q.question}</p>
                    {typeof q === "object" && q.hint && <p className="text-xs text-[#63636e] mt-2">Hint: {q.hint}</p>}
                  </div>
                </div>
              </div>
            ))}

            {activeTab === "behavioral" && (result.behavioral_questions || []).map((q: any, i: number) => (
              <div key={i} className="p-5 rounded-xl border border-[#1e1e24] bg-[#0f0f12]">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-blue-400 mt-0.5">Q{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{typeof q === "string" ? q : q.question}</p>
                    {typeof q === "object" && q.framework && <p className="text-xs text-[#63636e] mt-2">Framework: {q.framework}</p>}
                  </div>
                </div>
              </div>
            ))}

            {activeTab === "star" && (result.star_responses || result.star_examples || []).map((item: any, i: number) => (
              <div key={i} className="p-5 rounded-xl border border-[#1e1e24] bg-[#0f0f12]">
                <p className="text-sm font-medium mb-3 text-emerald-400">{item.situation || item.question || `Example ${i + 1}`}</p>
                <div className="space-y-2 text-xs text-[#a0a0ab]">
                  {item.task && <p><span className="text-[#63636e] font-medium">Task:</span> {item.task}</p>}
                  {item.action && <p><span className="text-[#63636e] font-medium">Action:</span> {item.action}</p>}
                  {item.result && <p><span className="text-[#63636e] font-medium">Result:</span> {item.result}</p>}
                </div>
              </div>
            ))}

            {activeTab === "company" && (
              <div className="p-5 rounded-xl border border-[#1e1e24] bg-[#0f0f12]">
                <p className="text-sm text-[#a0a0ab]">{result.company_research || result.company_prep || "Generate prep with a company name to see company-specific research."}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-16">
          <Sparkles className="h-10 w-10 text-[#45454e] mx-auto mb-3" />
          <p className="text-sm text-[#63636e]">Enter a role and generate interview preparation</p>
        </div>
      )}
    </div>
  )
}
