"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionHeader } from "@/components/ui/section-header"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { User, Save, ExternalLink } from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cvText, setCvText] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [github, setGithub] = useState("")
  const [portfolio, setPortfolio] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const supabase = createClient()

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle()
    if (data) {
      setProfile(data)
      setCvText(data.cv_text || "")
      setLinkedin(data.linkedin_url || "")
      setGithub(data.github_url || "")
      setPortfolio(data.portfolio_url || "")
      setTargetRole(data.target_role || "")
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("user_profiles").upsert({
      id: user.id,
      cv_text: cvText,
      linkedin_url: linkedin || null,
      github_url: github || null,
      portfolio_url: portfolio || null,
      target_role: targetRole || null,
    })
    setSaving(false)
  }

  if (loading) return <LoadingScreen />

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionHeader
        title="Profile"
        description="Manage your career profile and CV"
        icon={<User className="h-4 w-4 text-[var(--color-accent-violet)]" />}
      />

      {/* CV */}
      <div className="surface-card p-5">
        <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] mb-2 block">CV / Resume</Label>
        <RichTextEditor
          value={cvText}
          onChange={setCvText}
          placeholder="Paste your CV text here..."
        />
      </div>

      {/* Links */}
      <div className="surface-card p-5 space-y-3.5">
        <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] block">Links</Label>
        <div>
          <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">LinkedIn URL</Label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="https://linkedin.com/in/..." />
          </div>
        </div>
        <div>
          <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">GitHub URL</Label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            <Input value={github} onChange={(e) => setGithub(e.target.value)} className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="https://github.com/..." />
          </div>
        </div>
        <div>
          <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Portfolio URL</Label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            <Input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="https://..." />
          </div>
        </div>
      </div>

      {/* Career Settings */}
      <div className="surface-card p-5 space-y-3.5">
        <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] block">Career Settings</Label>
        <div>
          <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Target Role</Label>
          <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="e.g. Senior Frontend Engineer" />
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gradient-violet text-white border-0 px-5 h-9 text-sm font-semibold hover:opacity-90 shadow-glow group">
          {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : (
            <>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Profile
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
