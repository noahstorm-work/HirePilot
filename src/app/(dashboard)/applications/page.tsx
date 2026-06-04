"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Briefcase, Plus, ChevronRight
} from "lucide-react"
import Link from "next/link"

interface Application {
  id: string
  company: string
  role_title: string
  job_url: string | null
  status: string
  match_score: number | null
  created_at: string
  notes: string | null
  location: string | null
}

const columns = [
  { key: "Saved", color: "text-[#63636e]", dot: "bg-[#63636e]" },
  { key: "Applied", color: "text-blue-400", dot: "bg-blue-400" },
  { key: "Interview", color: "text-violet-400", dot: "bg-violet-400" },
  { key: "Offer", color: "text-emerald-400", dot: "bg-emerald-400" },
  { key: "Rejected", color: "text-rose-400", dot: "bg-rose-400" },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newApp, setNewApp] = useState({ company: "", role_title: "", job_url: "", notes: "" })
  const [creating, setCreating] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("All")
  const supabase = createClient()

  useEffect(() => { loadApplications() }, [])

  const loadApplications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    if (data) setApplications(data as Application[])
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!newApp.company || !newApp.role_title) return
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from("applications").insert({
      user_id: user.id, company: newApp.company, role_title: newApp.role_title,
      job_url: newApp.job_url || null, notes: newApp.notes || null, status: "Saved",
    }).select().single()

    if (data) setApplications((prev) => [data as Application, ...prev])
    setNewApp({ company: "", role_title: "", job_url: "", notes: "" })
    setDialogOpen(false)
    setCreating(false)
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase.from("applications").update({ status: newStatus }).eq("id", id)
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    )
  }

  const filteredApps = filterStatus === "All" ? applications : applications.filter((a) => a.status === filterStatus)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">Applications</h1>
          <p className="text-sm text-[#63636e] mt-1">{applications.length} total applications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-violet text-white border-0 hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f0f12] border-[#1e1e24] max-w-md">
            <DialogHeader>
              <DialogTitle className="font-[family-name:var(--font-display)]">New Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-xs text-[#63636e] mb-1.5 block">Company *</Label>
                <Input value={newApp.company} onChange={(e) => setNewApp({ ...newApp, company: e.target.value })} className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] focus:border-violet-500" placeholder="Acme Inc" />
              </div>
              <div>
                <Label className="text-xs text-[#63636e] mb-1.5 block">Role *</Label>
                <Input value={newApp.role_title} onChange={(e) => setNewApp({ ...newApp, role_title: e.target.value })} className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] focus:border-violet-500" placeholder="Senior Engineer" />
              </div>
              <div>
                <Label className="text-xs text-[#63636e] mb-1.5 block">Job URL</Label>
                <Input value={newApp.job_url} onChange={(e) => setNewApp({ ...newApp, job_url: e.target.value })} className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] focus:border-violet-500" placeholder="https://..." />
              </div>
              <div>
                <Label className="text-xs text-[#63636e] mb-1.5 block">Notes</Label>
                <Textarea value={newApp.notes} onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })} className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] focus:border-violet-500 min-h-[80px]" placeholder="Any notes..." />
              </div>
              <Button onClick={handleCreate} disabled={creating || !newApp.company || !newApp.role_title} className="w-full gradient-violet text-white border-0 hover:opacity-90">
                {creating ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Create Application"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#0f0f12] border border-[#1e1e24] overflow-x-auto">
        {(["All", ...columns.map((c) => c.key)] as const).map((status) => {
          const col = columns.find((c) => c.key === status)
          const count = status === "All" ? applications.length : applications.filter((a) => a.status === status).length
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filterStatus === status
                  ? "bg-violet-500/10 text-violet-400"
                  : "text-[#63636e] hover:text-[#a0a0ab] hover:bg-[#16161a]"
              }`}
            >
              {col && <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />}
              {status}
              <span className="text-[#45454e]">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Kanban Board */}
      {applications.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex p-4 rounded-2xl bg-[#16161a] border border-[#1e1e24] mb-4">
            <Briefcase className="h-8 w-8 text-[#45454e]" />
          </div>
          <p className="text-sm text-[#63636e] mb-4">No applications yet. Start tracking your career progress.</p>
          <Button onClick={() => setDialogOpen(true)} className="gradient-violet text-white border-0 hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" /> Add First Application
          </Button>
        </div>
      ) : filterStatus === "All" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {columns.map((col) => {
            const colApps = applications.filter((a) => a.status === col.key)
            return (
              <div key={col.key}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                  <span className="text-xs font-medium text-[#a0a0ab]">{col.key}</span>
                  <span className="text-xs text-[#45454e]">{colApps.length}</span>
                </div>
                <div className="space-y-2">
                  {colApps.map((app) => (
                    <Link key={app.id} href={`/applications/${app.id}`}>
                      <div className="p-3 rounded-xl border border-[#1e1e24] bg-[#0f0f12] hover:border-[#27272f] transition-all cursor-pointer group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium font-[family-name:var(--font-display)] truncate">{app.company}</p>
                            <p className="text-xs text-[#63636e] truncate mt-0.5">{app.role_title}</p>
                          </div>
                          {app.match_score != null && (
                            <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-violet-400 shrink-0">{app.match_score}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1e1e24]">
                          <span className="text-xs text-[#45454e]">{new Date(app.created_at).toLocaleDateString()}</span>
                          <ChevronRight className="h-3 w-3 text-[#45454e] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {colApps.length === 0 && (
                    <div className="p-4 rounded-xl border border-dashed border-[#1e1e24] text-center">
                      <p className="text-xs text-[#45454e]">No items</p>
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
              <div className="p-4 rounded-xl border border-[#1e1e24] bg-[#0f0f12] hover:border-[#27272f] transition-all cursor-pointer group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium font-[family-name:var(--font-display)] truncate">{app.company}</p>
                    <p className="text-xs text-[#63636e] truncate mt-0.5">{app.role_title}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
                    {app.match_score != null && (
                      <span className="text-xs font-bold font-[family-name:var(--font-mono)] text-violet-400">{app.match_score}</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      app.status === "Rejected" ? "bg-rose-500/10 text-rose-400" :
                      app.status === "Offer" ? "bg-emerald-500/10 text-emerald-400" :
                      app.status === "Interview" ? "bg-violet-500/10 text-violet-400" :
                      app.status === "Applied" ? "bg-blue-500/10 text-blue-400" :
                      "bg-[#45454e]/10 text-[#63636e]"
                    }`}>{app.status}</span>
                    <span className="text-xs text-[#45454e]">{new Date(app.created_at).toLocaleDateString()}</span>
                    <ChevronRight className="h-3 w-3 text-[#45454e] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filteredApps.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-[#45454e]">No {filterStatus.toLowerCase()} applications</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
