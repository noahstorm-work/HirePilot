"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SectionHeader } from "@/components/ui/section-header"
import { LoadingScreen } from "@/components/ui/loading-screen"
import type { ExtractedMetadata } from "@/lib/document-parser"
import { User, Save, Check } from "lucide-react"
import { toast } from "sonner"
import { CvSection } from "@/components/profile/CvSection"
import { LinksSection } from "@/components/profile/LinksSection"
import { CareerSettingsSection } from "@/components/profile/CareerSettingsSection"
import { AccountSection } from "@/components/profile/AccountSection"
import { DataSection } from "@/components/profile/DataSection"
import { DangerZoneSection } from "@/components/profile/DangerZoneSection"

export function ProfileClient() {
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
  const [userEmail, setUserEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
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

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserEmail(user.email || "")
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle()
    if (data) {
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadProfile() }, [])

  const handleChangePassword = async () => {
    if (!newPassword.trim()) return
    setChangingPassword(true)
    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Password updated")
        setNewPassword("")
      } else {
        toast.error(json.error || "Failed to update password")
      }
    } catch {
      toast.error("Failed to update password")
    }
    setChangingPassword(false)
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch("/api/account/export", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const json = await res.json()
      if (json.success) {
        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `hirepilot-export-${new Date().toISOString().split("T")[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("Data exported")
      } else {
        toast.error(json.error || "Export failed")
      }
    } catch {
      toast.error("Export failed")
    }
    setExporting(false)
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Account deleted")
        await supabase.auth.signOut()
        window.location.href = "/"
      } else {
        toast.error(json.error || "Failed to delete account")
      }
    } catch {
      toast.error("Failed to delete account")
    }
    setDeleting(false)
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

  if (loading) return <LoadingScreen />

  return (
    <div className="space-y-6 max-w-3xl">
      <SectionHeader
        title="Profile"
        description="Manage your career profile and CV"
        icon={<User className="h-4 w-4 text-[var(--color-accent-violet)]" />}
      />

      <CvSection
        cvText={cvText}
        setCvText={setCvText}
        fillFromMetadata={fillFromMetadata}
        scheduleAutoSave={scheduleAutoSave}
      />

      {/* Personal Info */}
      <div className="surface-card p-5 space-y-3.5">
        <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] block">Personal Info</Label>
        <div>
          <Label htmlFor="profile-name" className="text-[10px] text-[var(--color-text-muted)] mb-1 block">Full Name</Label>
          <Input id="profile-name" value={fullName} onChange={(e) => { setFullName(e.target.value); scheduleAutoSave() }} className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus-visible:border-[var(--color-border-focus)] h-9 text-sm" placeholder="John Doe" />
        </div>
      </div>

      <LinksSection
        linkedin={linkedin}
        setLinkedin={setLinkedin}
        github={github}
        setGithub={setGithub}
        portfolio={portfolio}
        setPortfolio={setPortfolio}
        scheduleAutoSave={scheduleAutoSave}
      />

      <CareerSettingsSection
        targetRole={targetRole}
        setTargetRole={setTargetRole}
        yearsExperience={yearsExperience}
        setYearsExperience={setYearsExperience}
        targetSeniority={targetSeniority}
        setTargetSeniority={setTargetSeniority}
        skills={skills}
        setSkills={setSkills}
        scheduleAutoSave={scheduleAutoSave}
      />

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

      <AccountSection
        userEmail={userEmail}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        changingPassword={changingPassword}
        handleChangePassword={handleChangePassword}
      />

      <DataSection
        exporting={exporting}
        handleExportData={handleExportData}
      />

      <DangerZoneSection
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        deleting={deleting}
        handleDeleteAccount={handleDeleteAccount}
      />
    </div>
  )
}