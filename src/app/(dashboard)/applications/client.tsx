"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SectionHeader } from "@/components/ui/section-header"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { KanbanBoard } from "@/components/applications/KanbanBoard"
import { Briefcase, Plus, Trash2, Link as LinkIcon, Loader2, Search } from "lucide-react"
import { CompanyAutocomplete } from "@/components/ui/company-autocomplete"
import { RoleAutocomplete } from "@/components/ui/role-autocomplete"
import { toast } from "sonner"
import Link from "next/link"
import { APPLICATION_STATUSES, STATUS_COLORS } from "@/lib/constants"
import { triggerAnalysis } from "@/lib/trigger-analysis"
import { logError } from "@/lib/error-service"
import type { Application } from "@/types"

const APPS_STORAGE_KEY = "applications_prefs"

export function ApplicationsClient() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newApp, setNewApp] = useState({ company: "", role_title: "", job_url: "", notes: "" })
  const [creating, setCreating] = useState(false)
  const [fetchUrl, setFetchUrl] = useState("")
  const [fetchingUrl, setFetchingUrl] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem(`${APPS_STORAGE_KEY}_filter`) || "All"
    return "All"
  })
  const [viewMode, setViewMode] = useState<"kanban" | "list">(() => {
    if (typeof window !== "undefined") return (localStorage.getItem(`${APPS_STORAGE_KEY}_view`) as "kanban" | "list") || "kanban"
    return "kanban"
  })
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
      if (mounted && data) setApplications(data as Application[])
      if (mounted) setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    localStorage.setItem(`${APPS_STORAGE_KEY}_filter`, filterStatus)
  }, [filterStatus])

  useEffect(() => {
    localStorage.setItem(`${APPS_STORAGE_KEY}_view`, viewMode)
  }, [viewMode])

  const handleCreate = async () => {
    if (!newApp.company || !newApp.role_title) return
    setCreating(true)
    const res = await fetch("/api/applications/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: newApp.company,
        role_title: newApp.role_title,
        job_url: newApp.job_url || undefined,
        notes: newApp.notes || undefined,
        status: "Saved",
      }),
    })
    const json = await res.json()
    if (!json.success) { toast.error("Failed to create application"); setCreating(false); return }
    if (json.data) {
      setApplications((prev) => [json.data as Application, ...prev])
      if (json.data.id) {
        const desc = newApp.notes || ""
        if (desc) triggerAnalysis(json.data.id, desc, newApp.company, newApp.role_title)
      }
    }
    setNewApp({ company: "", role_title: "", job_url: "", notes: "" })
    setFetchUrl("")
    setDialogOpen(false)
    setCreating(false)
    toast.success("Application created")
  }

  const handleFetchUrl = async () => {
    if (!fetchUrl.trim()) return
    setFetchingUrl(true)
    try {
      const res = await fetch("/api/jobs/paste-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fetchUrl }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        const d = json.data
        setNewApp((prev) => ({
          ...prev,
          job_url: fetchUrl,
          role_title: prev.role_title || d.role_title || "",
          company: prev.company || d.company || "",
          notes: prev.notes || d.description || "",
        }))
        toast.success("Job details fetched")
      } else {
        toast.error(json.error || "Failed to fetch job details")
      }
    } catch {
      toast.error("Failed to fetch job details")
      logError("URL fetch failed", "Failed to fetch job details", "applications-handleFetchUrl")
    }
    setFetchingUrl(false)
  }

  const handleStatusChange = useCallback(async (appId: string, newStatus: string) => {
    const previousApps = applications
    setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status: newStatus as Application["status"] } : a))

    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (!json.success) {
        setApplications(previousApps)
        toast.error("Failed to update status")
      } else {
        const app = applications.find((a) => a.id === appId)
        toast.success(`Moved to ${newStatus}`, { description: `${app?.company || "Application"} — ${app?.role_title || ""}` })
      }
    } catch {
      setApplications(previousApps)
      toast.error("Failed to update status")
    }
  }, [applications])

  const handleDelete = useCallback(async (appId: string) => {
    const previousApps = applications
    const app = applications.find((a) => a.id === appId)
    setApplications((prev) => prev.filter((a) => a.id !== appId))

    try {
      const res = await fetch(`/api/applications/${appId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        toast.success(`Deleted ${app?.company || "application"}`)
      } else {
        setApplications(previousApps)
        toast.error("Failed to delete")
      }
    } catch {
      setApplications(previousApps)
      toast.error("Failed to delete")
    }
  }, [applications])

  const filteredApps = useMemo(() => filterStatus === "All" ? applications : applications.filter((a) => a.status === filterStatus), [applications, filterStatus])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: applications.length }
    for (const app of applications) {
      counts[app.status] = (counts[app.status] || 0) + 1
    }
    return counts
  }, [applications])

  if (loading) return <LoadingScreen />

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
            <button onClick={() => setViewMode("kanban")} aria-pressed={viewMode === "kanban"} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${viewMode === "kanban" ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"}`}>
              Board
            </button>
            <button onClick={() => setViewMode("list")} aria-pressed={viewMode === "list"} className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${viewMode === "list" ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"}`}>
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
                <div className="p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] space-y-2">
                  <Label className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                    <LinkIcon className="h-3 w-3" /> Fetch from URL (optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={fetchUrl}
                      onChange={(e) => setFetchUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
                      className="flex-1 bg-[var(--color-bg-card)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] h-8 text-xs"
                      placeholder="Paste job URL to auto-fill fields..."
                    />
                    <Button onClick={handleFetchUrl} disabled={fetchingUrl || !fetchUrl.trim()} size="sm" variant="outline" className="h-8 px-3 border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
                      {fetchingUrl ? <Loader2 className="h-3 w-3 animate-spin" /> : "Fetch"}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-app-company" className="text-[11px] text-[var(--color-text-muted)] mb-1 block">Company *</Label>
                  <CompanyAutocomplete id="new-app-company" value={newApp.company} onChange={(v) => setNewApp({ ...newApp, company: v })} placeholder="Acme Inc" />
                </div>
                <div>
                  <Label htmlFor="new-app-role" className="text-[11px] text-[var(--color-text-muted)] mb-1 block">Role *</Label>
                  <RoleAutocomplete id="new-app-role" value={newApp.role_title} onChange={(v) => setNewApp({ ...newApp, role_title: v })} placeholder="Senior Engineer" />
                </div>
                <div>
                  <Label htmlFor="new-app-url" className="text-[11px] text-[var(--color-text-muted)] mb-1 block">Job URL</Label>
                  <Input id="new-app-url" value={newApp.job_url} onChange={(e) => setNewApp({ ...newApp, job_url: e.target.value })} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus-visible:border-[var(--color-border-focus)] h-9 text-sm" placeholder="https://..." />
                </div>
                <div>
                  <Label htmlFor="new-app-notes" className="text-[11px] text-[var(--color-text-muted)] mb-1 block">Notes</Label>
                  <Textarea id="new-app-notes" value={newApp.notes} onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus-visible:border-[var(--color-border-focus)] min-h-[60px] text-sm" placeholder="Any notes..." />
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
        {(["All", ...APPLICATION_STATUSES] as const).map((status) => {
          const statusKey = status as keyof typeof STATUS_COLORS
          const colorConfig = STATUS_COLORS[statusKey]
          const count = statusCounts[status] || 0
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                filterStatus === status ? "bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
              }`}
            >
              {colorConfig && <span className={`h-1.5 w-1.5 rounded-full ${colorConfig.dot}`} />}
              {status}
              <span className="opacity-60">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-14 w-14 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center mb-4">
            <Briefcase className="h-6 w-6 text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] font-[family-name:var(--font-display)] mb-1">
            No applications yet
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm text-center mb-5">
            Track your job applications through each stage of the hiring pipeline — from first save to offer.
          </p>
          <div className="flex items-center gap-1.5 mb-5">
            {APPLICATION_STATUSES.map((status) => {
              const colorConfig = STATUS_COLORS[status]
              return (
                <div key={status} className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
                  <span className={`h-1.5 w-1.5 rounded-full ${colorConfig.dot}`} />
                  <span className="text-[9px] text-[var(--color-text-muted)]">{status}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <Link href="/discover">
              <Button variant="outline" size="sm" className="border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] h-8 text-xs">
                <Search className="h-3 w-3 mr-1.5" /> Discover Jobs
              </Button>
            </Link>
            <Button onClick={() => setDialogOpen(true)} size="sm" className="gradient-violet text-white border-0 hover:opacity-90 shadow-glow h-8 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Manually
            </Button>
          </div>
        </div>
      ) : viewMode === "kanban" && filterStatus === "All" ? (
        <KanbanBoard
          applications={applications}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
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
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(app.id) }}
                      aria-label={`Delete ${app.role_title} application`}
                      className="p-1 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent-rose)] transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
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
