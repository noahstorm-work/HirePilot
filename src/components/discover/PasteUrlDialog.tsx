"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Link, Loader2 } from "lucide-react"

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
      if (json.success) {
        setResult(json.data)
      }
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
        <Button variant="outline">
          <Link className="h-4 w-4 mr-1.5" />
          Paste Job URL
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Job from URL</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Job URL</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://company.com/jobs/..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="company">Company (optional)</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role Title (optional)</Label>
              <Input
                id="role"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Senior Engineer"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            {loading ? "Fetching..." : "Fetch Job Details"}
          </Button>
        </form>

        {result && (
          <div className="mt-4 p-3 rounded-xl bg-gray-50 space-y-2">
            <p className="text-sm font-medium text-gray-900">{result.role_title}</p>
            {result.company && <p className="text-xs text-gray-500">{result.company}</p>}
            {result.description && (
              <p className="text-xs text-gray-500 line-clamp-3">{result.description}</p>
            )}
            <Button size="sm" className="w-full" onClick={handleSaveAsApplication}>
              Save as Application
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
