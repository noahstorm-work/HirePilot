"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Link as LinkIcon } from "lucide-react"

export function PasteUrlDialog() {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [company, setCompany] = useState("")
  const [roleTitle, setRoleTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
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
    } catch {}
    setLoading(false)
  }

  const handleSaveAsApplication = async () => {
    if (!result) return
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: result.company || company || "Unknown",
        role_title: result.role_title || roleTitle || "Unknown Role",
        job_url: url,
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
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-[#27272f] text-[#a0a0ab] hover:text-[#fafafa] hover:bg-[#16161a]">
          <LinkIcon className="h-4 w-4 mr-1.5" />
          Paste Job URL
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0f0f12] border-[#1e1e24]">
        <DialogHeader>
          <DialogTitle className="font-[family-name:var(--font-display)]">Import Job from URL</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-[#63636e]">Job URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://company.com/jobs/..." required className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-[#63636e]">Company (optional)</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e]" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-[#63636e]">Role Title (optional)</Label>
              <Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Senior Engineer" className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e]" />
            </div>
          </div>
          <Button type="submit" className="w-full gradient-violet text-white border-0 hover:opacity-90" disabled={loading}>
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-1" /> : null}
            {loading ? "Fetching..." : "Fetch Job Details"}
          </Button>
        </form>
        {result && (
          <div className="mt-4 p-4 rounded-xl bg-[#16161a] border border-[#1e1e24] space-y-2">
            <p className="text-sm font-medium text-[#fafafa]">{result.role_title}</p>
            {result.company && <p className="text-xs text-[#63636e]">{result.company}</p>}
            {result.description && <p className="text-xs text-[#45454e] line-clamp-3">{result.description}</p>}
            <Button size="sm" className="w-full gradient-violet text-white border-0 hover:opacity-90" onClick={handleSaveAsApplication}>
              Save as Application
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
