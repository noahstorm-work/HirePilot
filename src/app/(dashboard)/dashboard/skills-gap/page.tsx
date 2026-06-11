"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { CareerAnalysis, SkillsGap } from "@/types"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

interface SkillProgress {
  skill_name: string
  status: "identified" | "in_progress" | "completed"
}

const STATUS_CONFIG = {
  identified: { label: "Missing", color: "bg-[var(--color-accent-rose)]/10 text-[var(--color-accent-rose)]", dot: "bg-[var(--color-accent-rose)]" },
  in_progress: { label: "In Progress", color: "bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)]", dot: "bg-[var(--color-accent-amber)]" },
  completed: { label: "Completed", color: "bg-[var(--color-accent-emerald)]/10 text-[var(--color-accent-emerald)]", dot: "bg-[var(--color-accent-emerald)]" },
}

export default function SkillsGapPage() {
  const [data, setData] = useState<CareerAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [skillProgress, setSkillProgress] = useState<Map<string, string>>(new Map())
  const [rerunning, setRerunning] = useState(false)
  const supabase = createClient()

  const loadSkillsGap = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: analysis } = await supabase.from("career_analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
    setData(analysis)
    const { data: progress } = await supabase.from("skill_progress").select("skill_name, status").eq("user_id", user.id)
    if (progress) {
      const map = new Map<string, string>()
      progress.forEach((p: SkillProgress) => map.set(p.skill_name, p.status))
      setSkillProgress(map)
    }
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadSkillsGap() }, [])

  const updateSkillStatus = async (skillName: string, status: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from("skill_progress").upsert({
      user_id: user.id,
      skill_name: skillName,
      status,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,skill_name" })
    if (!error) {
      setSkillProgress((prev) => new Map(prev).set(skillName, status))
    }
  }

  const handleRerunAnalysis = async () => {
    setRerunning(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle()
      if (!profile?.cv_text) { toast.error("No CV in profile"); setRerunning(false); return }
      const linkedinAbout = typeof profile.linkedin_data === "object" && profile.linkedin_data ? (profile.linkedin_data as Record<string, unknown>).about as string || "" : ""
      const res = await fetch("/api/ai/career-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv_text: profile.cv_text,
          target_role: profile.target_role,
          linkedin_url: profile.linkedin_url,
          linkedin_about: linkedinAbout || undefined,
          github_url: profile.github_url,
          portfolio_url: profile.portfolio_url,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setData(json.data)
        toast.success("Analysis re-run complete")
      } else {
        toast.error(json.error || "Failed to re-run analysis")
      }
    } catch { toast.error("Failed to re-run analysis") }
    setRerunning(false)
  }

  if (loading) return <LoadingScreen />

  const missingTech = data?.missing_technologies || []
  const missingKeywords = data?.missing_keywords || []
  const missingExp = data?.missing_experience_areas || []
  const skillsGap = data?.skills_gap_analysis || []

  const allSkills = [...new Set([...missingTech, ...skillsGap.map((g: SkillsGap) => g.area || g.skill || g.name || "").filter(Boolean)])]
  const identified = allSkills.filter((s) => (skillProgress.get(s) || "identified") === "identified").length
  const inProgress = allSkills.filter((s) => skillProgress.get(s) === "in_progress").length
  const completed = allSkills.filter((s) => skillProgress.get(s) === "completed").length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Skills Gap Tracker"
          description={data ? `Last analyzed ${new Date(data.created_at).toLocaleDateString()}` : "Track missing skills and their career impact"}
          icon={<Target className="h-4 w-4 text-[var(--color-accent-amber)]" />}
        />
        <Button onClick={handleRerunAnalysis} disabled={rerunning} size="sm" variant="outline" className="border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] text-xs">
          {rerunning ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
          {rerunning ? "Re-running..." : "Re-run Analysis"}
        </Button>
      </div>

      {!data ? (
        <EmptyState
          icon={Target}
          title="No skills gap data yet"
          description="Run a career analysis first to identify your skills gaps and track your progress."
        />
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="surface-card p-4 text-center">
              <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-rose)]">{identified}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Missing</p>
            </div>
            <div className="surface-card p-4 text-center">
              <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-amber)]">{inProgress}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">In Progress</p>
            </div>
            <div className="surface-card p-4 text-center">
              <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-emerald)]">{completed}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Completed</p>
            </div>
            <div className="surface-card p-4 text-center">
              <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-violet)]">{missingExp.length}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Exp. Gaps</p>
            </div>
          </div>

          {/* Missing Technologies */}
          {missingTech.length > 0 && (
            <div className="surface-card p-5">
              <SectionHeader title="Missing Technologies" icon={<AlertTriangle className="h-4 w-4 text-[var(--color-accent-amber)]" />} />
              <div className="space-y-2 mt-3">
                {missingTech.map((tech: string) => {
                  const status = (skillProgress.get(tech) || "identified") as keyof typeof STATUS_CONFIG
                  const config = STATUS_CONFIG[status]
                  return (
                    <div key={tech} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${config.dot}`} />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{tech}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">Commonly required</p>
                      </div>
                      <Select value={status} onValueChange={(v) => updateSkillStatus(tech, v)}>
                        <SelectTrigger className="h-6 px-2 py-1 text-[10px] w-auto min-w-[90px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="identified">Missing</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Missing Keywords */}
          {missingKeywords.length > 0 && (
            <div className="surface-card p-5">
              <SectionHeader title="Missing Keywords" icon={<TrendingUp className="h-4 w-4 text-[var(--color-accent-blue)]" />} />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {missingKeywords.map((kw: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-[10px] bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)] border border-[var(--color-accent-blue)]/20">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Experience Areas */}
          {missingExp.length > 0 && (
            <div className="surface-card p-5">
              <SectionHeader title="Experience Gaps" icon={<CheckCircle2 className="h-4 w-4 text-[var(--color-accent-violet)]" />} />
              <div className="space-y-2 mt-3">
                {missingExp.map((exp: string, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-accent-violet)] shrink-0" />
                    <span className="text-xs text-[var(--color-text-secondary)]">{exp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Gap Analysis */}
          {skillsGap.length > 0 && (
            <div className="surface-card p-5">
              <SectionHeader title="Detailed Skills Analysis" icon={<Target className="h-4 w-4 text-[var(--color-accent-emerald)]" />} />
              <div className="space-y-2 mt-3">
                {skillsGap.map((gap: SkillsGap, i: number) => {
                  const skillName = gap.area || gap.skill || gap.name || `Skill ${i + 1}`
                  const status = (skillProgress.get(skillName) || "identified") as keyof typeof STATUS_CONFIG
                  const config = STATUS_CONFIG[status]
                  return (
                    <div key={i} className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                          <p className="text-xs font-medium">{skillName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                            gap.severity === "high" ? "bg-[var(--color-accent-rose)]/10 text-[var(--color-accent-rose)]" :
                            gap.severity === "medium" ? "bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)]" :
                            "bg-[var(--color-accent-emerald)]/10 text-[var(--color-accent-emerald)]"
                          }`}>{gap.severity || "medium"}</span>
                          <Select value={status} onValueChange={(v) => updateSkillStatus(skillName, v)}>
                            <SelectTrigger className="h-6 px-2 py-1 text-[10px] w-auto min-w-[90px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="identified">Missing</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {gap.impact && <p className="text-[10px] text-[var(--color-text-muted)] ml-4">Impact: {gap.impact}</p>}
                      {gap.detail && <p className="text-[10px] text-[var(--color-text-muted)] ml-4 mt-0.5">{gap.detail}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
