"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Briefcase, Plus, ChevronRight } from "lucide-react"
import { CompanyAutocomplete } from "@/components/ui/company-autocomplete"
import { RoleAutocomplete } from "@/components/ui/role-autocomplete"
import { toast } from "sonner"
import Link from "next/link"
import { APPLICATION_STATUSES, STATUS_COLORS } from "@/lib/constants"

interface AppItem {
  id: string; company: string; role_title: string; job_url: string | null;
  status: string; match_score: number | null; created_at: string; notes: string | null; location: string | null;
}

const columns = APPLICATION_STATUSES.map((status) => ({ key: status, color: STATUS_COLORS[status].text, dot: STATUS_COLORS[status].dot }))

const APPS_STORAGE_KEY = "applications_prefs"

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newApp, setNewApp] = useState({ company: "", role_title: "", job_url: "", notes: "" })
  const [creating, setCreating] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem(`${APPS_STORAGE_KEY}_filter`) || "All"
    return "All"
  })
  const [viewMode, setViewMode] = useState<"kanban" | "list">(() => {
    if (typeof window !== "undefined") return (localStorage.getItem(`${APPS_STORAGE_KEY}_view`) as "kanban" | "list") || "kanban"
    return "kanban"
  })
  const supabase = createClient()

  useEffect(() => { loadApplications() }, [])

  useEffect(() => {
    localStorage.setItem(`${APPS_STORAGE_KEY}_filter`, filterStatus)
  }, [filterStatus])

  useEffect(() => {
    localStorage.setItem(`${APPS_STORAGE_KEY}_view`, viewMode)
  }, [viewMode])

  const loadApplications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    if (data) setApplications(data as AppItem[])
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!newApp.company || !newApp.role_title) return
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase.from("applications").insert({
      user_id: user.id, company: newApp.company, role_title: newApp.role_title,
      job_url: newApp.job_url || null, notes: newApp.notes || null, status: "Saved",
    }).select().single()
    if (error) { toast.error("Failed to create application"); setCreating(false); return }
    if (data) setApplications((prev) => [data as AppItem, ...prev])
    setNewApp({ company: "", role_title: "", job_url: "", notes: "" })
    setDialogOpen(false)
    setCreating(false)
    toast.success("Application created")
  }

  if (loading) return <LoadingScreen />

  const filteredApps = filterStatus === "All" ? applications : applications.filter((a) => a.status === filterStatus)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader
          title="Applications"
          description={`${applications.length} total applications`}
          icon={<Briefcase className="h-4 w-4 text-[var(--color-accent-blue)]" />}
        />
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
            <button onClick={() => setViewMode("kanban")} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${viewMode === "kanban" ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"}`}>
              Board
            </button>
            <button onClick={() => setViewMode("list")} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${viewMode === "list" ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"}`}>
              List
            </button>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-violet text-white border-0 hover:opacity-90 shadow-glow text-xs">
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Add
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--color-bg-card)] border-[var(--color-border-subtle)] max-w-md">
              <DialogHeader>
                <DialogTitle className="font-[family-name:var(--font-display)] text-sm">New Application</DialogTitle>
                <DialogDescription className="sr-only">Create a new job application</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-3">
                <div>
                  <Label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">Company *</Label>
                  <CompanyAutocomplete value={newApp.company} onChange={(v) => setNewApp({ ...newApp, company: v })} placeholder="Acme Inc" />
                </div>
                <div>
                  <Label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">Role *</Label>
                  <RoleAutocomplete value={newApp.role_title} onChange={(v) => setNewApp({ ...newApp, role_title: v })} placeholder="Senior Engineer" />
                </div>
                <div>
                  <Label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">Job URL</Label>
                  <Input value={newApp.job_url} onChange={(e) => setNewApp({ ...newApp, job_url: e.target.value })} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="https://..." />
                </div>
                <div>
                  <Label className="text-[11px] text-[var(--color-text-muted)] mb-1 block">Notes</Label>
                  <Textarea value={newApp.notes} onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] min-h-[60px] text-sm" placeholder="Any notes..." />
                </div>
                <Button onClick={handleCreate} disabled={creating || !newApp.company || !newApp.role_title} className="w-full gradient-violet text-white border-0 hover:opacity-90 h-9 text-sm">
                  {creating ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-0.5 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] overflow-x-auto">
        {(["All", ...columns.map((c) => c.key)] as const).map((status) => {
          const col = columns.find((c) => c.key === status)
          const count = status === "All" ? applications.length : applications.filter((a) => a.status === status).length
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                filterStatus === status ? "bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
              }`}
            >
              {col && <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />}
              {status}
              <span className="opacity-60">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications yet"
          description="Start tracking your career progress by adding your first application."
          action={
            <Button onClick={() => setDialogOpen(true)} className="gradient-violet text-white border-0 hover:opacity-90 shadow-glow text-sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Application
            </Button>
          }
        />
      ) : viewMode === "kanban" && filterStatus === "All" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {columns.map((col) => {
            const colApps = applications.filter((a) => a.status === col.key)
            return (
              <div key={col.key}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
                  <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">{col.key}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">{colApps.length}</span>
                </div>
                <div className="space-y-2">
                  {colApps.map((app) => (
                    <Link key={app.id} href={`/applications/${app.id}`}>
                      <div className="p-3 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-default cursor-pointer group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium font-[family-name:var(--font-display)] truncate">{app.company}</p>
                            <p className="text-[10px] text-[var(--color-text-muted)] truncate mt-0.5">{app.role_title}</p>
                          </div>
                          {app.match_score != null && (
                            <span className="text-[10px] font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent-violet)] shrink-0">{app.match_score}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border-subtle)]">
                          <span className="text-[9px] text-[var(--color-text-muted)]">{new Date(app.created_at).toLocaleDateString()}</span>
                          <ChevronRight className="h-2.5 w-2.5 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {colApps.length === 0 && (
                    <div className="p-3 rounded-xl border border-dashed border-[var(--color-border-subtle)] text-center">
                      <p className="text-[10px] text-[var(--color-text-muted)]">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredApps.map((app) => (
            <Link key={app.id} href={`/applications/${app.id}`}>
              <div className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-default cursor-pointer group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium font-[family-name:var(--font-display)] truncate">{app.company}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{app.role_title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {app.match_score != null && (
                      <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent-violet)]">{app.match_score}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      STATUS_COLORS[app.status as keyof typeof STATUS_COLORS]?.bg || "bg-[var(--color-bg-elevated)]"
                    } ${STATUS_COLORS[app.status as keyof typeof STATUS_COLORS]?.text || "text-[var(--color-text-muted)]"}`}>{app.status}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filteredApps.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xs text-[var(--color-text-muted)]">No {filterStatus.toLowerCase()} applications</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
