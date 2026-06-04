"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Target, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function SkillsGapPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { loadSkillsGap() }, [])

  const loadSkillsGap = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: analysis } = await supabase.from("career_analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle()
    setData(analysis)
    setLoading(false)
  }

  if (loading) return <LoadingScreen />

  const missingTech = data?.missing_technologies || []
  const missingKeywords = data?.missing_keywords || []
  const missingExp = data?.missing_experience_areas || []
  const skillsGap = data?.skills_gap_analysis || []

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Skills Gap Tracker"
        description="Track missing skills and their career impact"
        icon={<Target className="h-4 w-4 text-[var(--color-accent-amber)]" />}
      />

      {!data ? (
        <EmptyState
          icon={Target}
          title="No skills gap data yet"
          description="Run a career analysis first to identify your skills gaps and track your progress."
        />
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="surface-card p-4 text-center">
              <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-amber)]">{missingTech.length}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Missing Technologies</p>
            </div>
            <div className="surface-card p-4 text-center">
              <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-blue)]">{missingKeywords.length}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Missing Keywords</p>
            </div>
            <div className="surface-card p-4 text-center">
              <p className="text-2xl font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-violet)]">{missingExp.length}</p>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">Experience Gaps</p>
            </div>
          </div>

          {/* Missing Technologies */}
          {missingTech.length > 0 && (
            <div className="surface-card p-5">
              <SectionHeader title="Missing Technologies" icon={<AlertTriangle className="h-4 w-4 text-[var(--color-accent-amber)]" />} />
              <div className="space-y-2 mt-3">
                {missingTech.map((tech: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                    <div className="h-7 w-7 rounded-lg bg-[var(--color-accent-amber)]/10 flex items-center justify-center shrink-0">
                      <Target className="h-3.5 w-3.5 text-[var(--color-accent-amber)]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{tech}</p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">High priority — commonly required</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--color-accent-rose)]/10 text-[var(--color-accent-rose)]">Missing</span>
                  </div>
                ))}
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
                {skillsGap.map((gap: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium">{gap.skill || gap.name || `Skill ${i + 1}`}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        gap.severity === "high" ? "bg-[var(--color-accent-rose)]/10 text-[var(--color-accent-rose)]" :
                        gap.severity === "medium" ? "bg-[var(--color-accent-amber)]/10 text-[var(--color-accent-amber)]" :
                        "bg-[var(--color-accent-emerald)]/10 text-[var(--color-accent-emerald)]"
                      }`}>{gap.severity || "medium"}</span>
                    </div>
                    {gap.impact && <p className="text-[10px] text-[var(--color-text-muted)]">Impact: {gap.impact}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
