"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GitBranch, Plus, Trash2, Eye, RotateCcw } from "lucide-react"
import { toast } from "sonner"

interface CVVersion {
  id: string; version_label: string; cv_text: string;
  interview_count: number; offer_count: number; application_count: number;
  created_at: string;
}

export function CVVersionsClient() {
  const [versions, setVersions] = useState<CVVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [viewVersion, setViewVersion] = useState<CVVersion | null>(null)
  const [restoring, setRestoring] = useState<string | null>(null)
  const supabase = createClient()

  const loadVersions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from("cv_versions").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    if (data) setVersions(data as CVVersion[])
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadVersions() }, [])

  const handleCreateVersion = async () => {
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from("user_profiles").select("cv_text").eq("id", user.id).maybeSingle()
    if (!profile?.cv_text) { setCreating(false); toast.error("No CV text in profile. Add a CV first."); return }
    const versionNum = versions.length + 1
    const { data, error } = await supabase.from("cv_versions").insert({
      user_id: user.id, version_label: `v${versionNum}`, cv_text: profile.cv_text,
    }).select().single()
    if (error) { toast.error("Failed to save version"); setCreating(false); return }
    if (data) setVersions((prev) => [data as CVVersion, ...prev])
    setCreating(false)
    toast.success(`Version v${versionNum} saved`)
  }

  const handleDelete = async (id: string) => {
    await supabase.from("cv_versions").delete().eq("id", id)
    setVersions((prev) => prev.filter((v) => v.id !== id))
    toast.success("Version deleted")
  }

  const handleRestore = async (version: CVVersion) => {
    setRestoring(version.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from("user_profiles").upsert({
      id: user.id,
      cv_text: version.cv_text,
    }, { onConflict: "id" })
    setRestoring(null)
    if (error) toast.error("Failed to restore version")
    else toast.success(`${version.version_label} restored to profile`)
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="CV Versions"
          description="Track and compare different versions of your CV"
          icon={<GitBranch className="h-4 w-4 text-[var(--color-accent-violet)]" />}
        />
        <Button onClick={handleCreateVersion} disabled={creating} size="sm" className="gradient-violet text-white border-0 hover:opacity-90 shadow-glow text-xs">
          {creating ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : (
            <><Plus className="h-3.5 w-3.5 mr-1" /> Save Current CV</>
          )}
        </Button>
      </div>

      {versions.length === 0 ? (
        <EmptyState
          icon={GitBranch}
          title="No CV versions yet"
          description="Save your current CV as a version to track changes and compare performance over time."
          action={
            <Button onClick={handleCreateVersion} disabled={creating} className="gradient-violet text-white border-0 hover:opacity-90 shadow-glow text-sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Save First Version
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {versions.map((version, i) => (
            <div key={version.id} className="surface-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[var(--color-accent-violet)]/10 flex items-center justify-center">
                    <GitBranch className="h-4 w-4 text-[var(--color-accent-violet)]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold font-[family-name:var(--font-display)]">{version.version_label}</p>
                      {i === 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-[var(--color-accent-emerald)]/10 text-[var(--color-accent-emerald)] border border-[var(--color-accent-emerald)]/20">Latest</span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                      Created {new Date(version.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setViewVersion(version)} aria-label="View CV" className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent-blue)] hover:bg-[var(--color-bg-hover)] transition-colors">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleRestore(version)} disabled={restoring === version.id} aria-label="Restore to profile" className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent-emerald)] hover:bg-[var(--color-bg-hover)] transition-colors disabled:opacity-50">
                    {restoring === version.id ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--color-accent-emerald)] border-t-transparent" /> : <RotateCcw className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => handleDelete(version.id)} aria-label="Delete version" className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent-rose)] hover:bg-[var(--color-bg-hover)] transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
                <div className="text-center">
                  <p className="text-lg font-bold font-[family-name:var(--font-display)]">{version.application_count}</p>
                  <p className="text-[9px] text-[var(--color-text-muted)]">Applications</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-violet)]">{version.interview_count}</p>
                  <p className="text-[9px] text-[var(--color-text-muted)]">Interviews</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold font-[family-name:var(--font-display)] text-[var(--color-accent-emerald)]">{version.offer_count}</p>
                  <p className="text-[9px] text-[var(--color-text-muted)]">Offers</p>
                </div>
              </div>
              {version.application_count > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--color-text-muted)]">Interview Rate</span>
                    <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent-violet)]">
                      {Math.round((version.interview_count / version.application_count) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* View CV Dialog */}
      <Dialog open={!!viewVersion} onOpenChange={() => setViewVersion(null)}>
        <DialogContent className="bg-[var(--color-bg-card)] border-[var(--color-border-subtle)] max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-display)] text-sm">
              {viewVersion?.version_label} — CV Text
            </DialogTitle>
            <DialogDescription className="sr-only">View CV text for this version</DialogDescription>
          </DialogHeader>
          {viewVersion && (
            <div className="mt-3 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
              <pre className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap leading-relaxed font-[family-name:var(--font-body)]">{viewVersion.cv_text}</pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
