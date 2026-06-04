"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  User, Save, CheckCircle2, Plus, Trash2, ExternalLink
} from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cvText, setCvText] = useState("")
  const supabase = createClient()

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle()
    if (data) {
      setProfile(data)
      setCvText(data.cv_text || "")
    }
    setLoading(false)
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSaving(true)

    if (profile) {
      await supabase.from("user_profiles").update({
        cv_text: cvText,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url,
        portfolio_url: profile.portfolio_url,
        target_role: profile.target_role,
      }).eq("id", user.id)
    } else {
      const { data } = await supabase.from("user_profiles").insert({
        id: user.id,
        cv_text: cvText,
        linkedin_url: profile?.linkedin_url || "",
        github_url: profile?.github_url || "",
        portfolio_url: profile?.portfolio_url || "",
        target_role: profile?.target_role || "",
      }).select().single()
      if (data) setProfile(data)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return <div className="flex items-center justify-center py-32"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">Profile</h1>
        <p className="text-sm text-[#63636e] mt-1">Manage your career profile and CV</p>
      </div>

      {/* CV Section */}
      <div className="p-6 rounded-2xl border border-[#1e1e24] bg-[#0f0f12]">
        <h2 className="text-sm font-medium text-[#a0a0ab] mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-violet-400" />
          CV / Resume
        </h2>
        <RichTextEditor
          value={cvText}
          onChange={setCvText}
          placeholder="Paste your CV or resume text here..."
          className="min-h-[300px]"
        />
      </div>

      {/* Links Section */}
      <div className="p-6 rounded-2xl border border-[#1e1e24] bg-[#0f0f12]">
        <h2 className="text-sm font-medium text-[#a0a0ab] mb-4">Online Presence</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-[#63636e] mb-1.5 block">LinkedIn URL</Label>
            <Input
              value={profile?.linkedin_url || ""}
              onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
              className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e] focus:border-violet-500"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div>
            <Label className="text-xs text-[#63636e] mb-1.5 block">GitHub URL</Label>
            <Input
              value={profile?.github_url || ""}
              onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
              className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e] focus:border-violet-500"
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <Label className="text-xs text-[#63636e] mb-1.5 block">Portfolio URL</Label>
            <Input
              value={profile?.portfolio_url || ""}
              onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
              className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e] focus:border-violet-500"
              placeholder="https://yoursite.com"
            />
          </div>
          <div>
            <Label className="text-xs text-[#63636e] mb-1.5 block">Target Role</Label>
            <Input
              value={profile?.target_role || ""}
              onChange={(e) => setProfile({ ...profile, target_role: e.target.value })}
              className="bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e] focus:border-violet-500"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="gradient-violet text-white border-0 hover:opacity-90">
          {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" /> : saved ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {saved ? "Saved!" : "Save Profile"}
        </Button>
      </div>
    </div>
  )
}
