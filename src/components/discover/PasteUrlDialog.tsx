"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"
import { triggerAnalysis } from "@/lib/trigger-analysis"
import type { JobSearchResult } from "@/lib/jobs/types"

export function PasteUrlDialog() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [company, setCompany] = useState("")
  const [roleTitle, setRoleTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Partial<JobSearchResult> | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/jobs/paste-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, company, roleTitle }),
      })
      const json = await res.json()
      if (json.success) setResult(json.data)
      else toast.error(json.error || "Failed to fetch job")
    } catch { toast.error("Failed to fetch job") }
    setLoading(false)
  }

  const handleSaveAsApplication = async () => {
    if (!result) return
    const res = await fetch("/api/applications/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: result.company || company || "Unknown",
        role_title: result.role_title || roleTitle || "Unknown Role",
        job_url: url,
        job_description: result.description || "",
        application_source: "url",
      }),
    })
    const json = await res.json()
    if (json.success) {
      setOpen(false)
      setUrl("")
      setCompany("")
      setRoleTitle("")
      setResult(null)
      router.refresh()
      if (json.data?.id && result.description) {
        triggerAnalysis(json.data.id, result.description, result.company || company || "Unknown", result.role_title || roleTitle || "Unknown Role")
      }
      toast.success("Job imported — analysis running")
    } else {
      toast.error(json.error || "Failed to save")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] h-10 text-sm">
          <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
          Paste URL
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[var(--color-bg-card)] border-[var(--color-border-subtle)]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)] text-sm">Import Job from URL</DialogTitle>
          <DialogDescription className="sr-only">Import a job listing from any URL</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="paste-url" className="text-xs text-[var(--color-text-muted)]">Job URL</Label>
            <Input id="paste-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://company.com/jobs/..." required className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="paste-company" className="text-xs text-[var(--color-text-muted)]">Company (optional)</Label>
              <Input id="paste-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paste-role" className="text-xs text-[var(--color-text-muted)]">Role Title (optional)</Label>
              <Input id="paste-role" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Senior Engineer" className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]" />
            </div>
          </div>
          <Button type="submit" className="w-full gradient-violet text-white border-0 hover:opacity-90" disabled={loading}>
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" /> : null}
            {loading ? "Fetching..." : "Fetch Job Details"}
          </Button>
        </form>
        {result && (
          <div className="mt-4 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] space-y-2">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{result.role_title}</p>
            {result.company && <p className="text-xs text-[var(--color-text-muted)]">{result.company}</p>}
            {result.description && <p className="text-xs text-[var(--color-text-muted)] line-clamp-3">{result.description}</p>}
            <Button size="sm" className="w-full gradient-violet text-white border-0 hover:opacity-90" onClick={handleSaveAsApplication}>
              Save as Application
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
