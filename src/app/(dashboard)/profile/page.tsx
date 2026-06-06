"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionHeader } from "@/components/ui/section-header"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { DocumentUpload } from "@/components/ui/document-upload"
import type { ExtractedMetadata } from "@/lib/document-parser"
import { User, Save, ExternalLink, X, Check } from "lucide-react"
import { toast } from "sonner"
import type { UserProfile } from "@/types"

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [autoSaved, setAutoSaved] = useState(false)
  const [cvText, setCvText] = useState("")
  const [fullName, setFullName] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [github, setGithub] = useState("")
  const [portfolio, setPortfolio] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [yearsExperience, setYearsExperience] = useState("")
  const [targetSeniority, setTargetSeniority] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const supabase = createClient()
  const isDirty = useRef(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from("user_profiles").upsert({
      id: user.id,
      cv_text: cvText,
      full_name: fullName || null,
      linkedin_url: linkedin || null,
      github_url: github || null,
      portfolio_url: portfolio || null,
      target_role: targetRole || null,
      years_experience: yearsExperience ? parseInt(yearsExperience) : null,
      target_seniority: targetSeniority || null,
      skills,
    }, { onConflict: "id" })
    isDirty.current = false
    setAutoSaved(true)
    setTimeout(() => setAutoSaved(false), 2000)
    if (error) toast.error("Auto-save failed")
  }, [cvText, fullName, linkedin, github, portfolio, targetRole, yearsExperience, targetSeniority, skills, supabase])

  const scheduleAutoSave = useCallback(() => {
    isDirty.current = true
    setAutoSaved(false)
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => saveProfile(), 3000)
  }, [saveProfile])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty.current) {
        e.preventDefault()
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [])

  useEffect(() => {
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [])

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle()
    if (data) {
      setProfile(data)
      setCvText(data.cv_text || "")
      setFullName(data.full_name || "")
      setLinkedin(data.linkedin_url || "")
      setGithub(data.github_url || "")
      setPortfolio(data.portfolio_url || "")
      setTargetRole(data.target_role || "")
      setYearsExperience(data.years_experience?.toString() || "")
      setTargetSeniority(data.target_seniority || "")
      setSkills(data.skills || [])
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await saveProfile()
    setSaving(false)
    toast.success("Profile saved")
  }

  const fillFromMetadata = (meta: ExtractedMetadata) => {
    if (meta.full_name && !fullName) setFullName(meta.full_name)
    if (meta.linkedin_url && !linkedin) setLinkedin(meta.linkedin_url)
    if (meta.github_url && !github) setGithub(meta.github_url)
    if (meta.portfolio_url && !portfolio) setPortfolio(meta.portfolio_url)
    if (meta.skills?.length && skills.length === 0) setSkills(meta.skills)
    const filled = [meta.full_name, meta.linkedin_url, meta.github_url, meta.portfolio_url, meta.skills?.length].filter(Boolean).length
    if (filled > 0) toast.success(`Auto-filled ${filled} field${filled > 1 ? "s" : ""} from document`)
  }

  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed])
      setSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
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
        <div className="flex items-center justify-between mb-2">
          <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)]">CV / Resume</Label>
          <DocumentUpload onTextExtracted={(text, meta) => {
            setCvText(text.replace(/\n/g, "<br>"))
            if (meta) fillFromMetadata(meta)
          }} label="Upload CV" />
        </div>
        <RichTextEditor
          value={cvText}
          onChange={(v) => { setCvText(v); scheduleAutoSave() }}
          placeholder="Paste your CV text here..."
        />
      </div>

      {/* Personal Info */}
      <div className="surface-card p-5 space-y-3.5">
        <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] block">Personal Info</Label>
        <div>
          <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Full Name</Label>
          <Input value={fullName} onChange={(e) => { setFullName(e.target.value); scheduleAutoSave() }} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="John Doe" />
        </div>
      </div>

      {/* Links */}
      <div className="surface-card p-5 space-y-3.5">
        <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] block">Links</Label>
        <div>
          <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">LinkedIn URL</Label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            <Input value={linkedin} onChange={(e) => { setLinkedin(e.target.value); scheduleAutoSave() }} className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="https://linkedin.com/in/..." />
          </div>
        </div>
        <div>
          <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">GitHub URL</Label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            <Input value={github} onChange={(e) => { setGithub(e.target.value); scheduleAutoSave() }} className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="https://github.com/..." />
          </div>
        </div>
        <div>
          <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Portfolio URL</Label>
          <div className="relative">
            <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            <Input value={portfolio} onChange={(e) => { setPortfolio(e.target.value); scheduleAutoSave() }} className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="https://..." />
          </div>
        </div>
      </div>

      {/* Career Settings */}
      <div className="surface-card p-5 space-y-3.5">
        <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] block">Career Settings</Label>
        <div>
          <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Target Role</Label>
          <RoleAutocomplete value={targetRole} onChange={(v) => { setTargetRole(v); scheduleAutoSave() }} placeholder="e.g. Senior Frontend Engineer" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Years of Experience</Label>
            <Input type="number" min="0" max="30" value={yearsExperience} onChange={(e) => { setYearsExperience(e.target.value); scheduleAutoSave() }} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="0" />
          </div>
          <div>
            <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Seniority Level</Label>
            <select value={targetSeniority} onChange={(e) => { setTargetSeniority(e.target.value); scheduleAutoSave() }} className="w-full h-9 rounded-xl px-3 text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:outline-none">
              <option value="">Select level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="lead">Lead</option>
            </select>
          </div>
        </div>
        <div>
          <Label className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Skills</Label>
          <div className="flex gap-2">
            <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} className="flex-1 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder="Type a skill and press Enter" />
            <Button type="button" onClick={addSkill} variant="outline" size="sm" className="h-9 px-3 border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">Add</Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)] border border-[var(--color-accent-violet)]/20">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-[var(--color-accent-rose)] transition-colors"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {autoSaved && (
          <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-accent-emerald)]">
            <Check className="h-3 w-3" /> Auto-saved
          </span>
        )}
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

function RoleAutocomplete({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const timerRef = useState<NodeJS.Timeout | null>(null)

  useEffect(() => { setQuery(value) }, [value])

  const handleChange = (val: string) => {
    setQuery(val)
    onChange(val)
    if (timerRef[0]) clearTimeout(timerRef[0])
    if (val.length < 1) { setSuggestions([]); return }
    timerRef[0] = setTimeout(async () => {
      const res = await fetch(`/api/autocomplete/roles?q=${encodeURIComponent(val)}`)
      const json = await res.json()
      if (json.success) { setSuggestions(json.data); setIsOpen(json.data.length > 0) }
    }, 300)
  }

  return (
    <div className="relative">
      <Input value={query} onChange={(e) => handleChange(e.target.value)} onFocus={() => { if (suggestions.length > 0) setIsOpen(true) }} onBlur={() => setTimeout(() => setIsOpen(false), 200)} className="bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] h-9 text-sm" placeholder={placeholder} />
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <button key={`${s}-${i}`} onMouseDown={() => { setQuery(s); onChange(s); setIsOpen(false) }} className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]">{s}</button>
          ))}
        </div>
      )}
    </div>
  )
}
