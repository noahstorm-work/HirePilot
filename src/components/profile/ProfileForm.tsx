"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Save, Loader2 } from "lucide-react"
import type { SeniorityLevel } from "@/types"

interface Props {
  initialData: {
    full_name?: string | null
    target_role?: string | null
    target_seniority?: string | null
    years_experience?: number | null
    linkedin_url?: string | null
    github_url?: string | null
    portfolio_url?: string | null
  }
}

export function ProfileForm({ initialData }: Props) {
  const [fullName, setFullName] = useState(initialData.full_name ?? "")
  const [targetRole, setTargetRole] = useState(initialData.target_role ?? "")
  const [targetSeniority, setTargetSeniority] = useState(initialData.target_seniority ?? "")
  const [yearsExp, setYearsExp] = useState(initialData.years_experience?.toString() ?? "")
  const [linkedinUrl, setLinkedinUrl] = useState(initialData.linkedin_url ?? "")
  const [githubUrl, setGithubUrl] = useState(initialData.github_url ?? "")
  const [portfolioUrl, setPortfolioUrl] = useState(initialData.portfolio_url ?? "")
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("user_profiles").upsert({
      id: user.id,
      full_name: fullName || null,
      target_role: targetRole || null,
      target_seniority: (targetSeniority as SeniorityLevel) || null,
      years_experience: yearsExp ? parseInt(yearsExp) : null,
      linkedin_url: linkedinUrl || null,
      github_url: githubUrl || null,
      portfolio_url: portfolioUrl || null,
    })

    if (!error) {
      router.refresh()
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearsExp">Years of Experience</Label>
          <Input id="yearsExp" type="number" value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} placeholder="5" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetRole">Target Role</Label>
          <Input id="targetRole" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Senior Frontend Engineer" />
        </div>
        <div className="space-y-2">
          <Label>Target Seniority</Label>
          <Select value={targetSeniority} onValueChange={setTargetSeniority}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="mid">Mid-Level</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedin">LinkedIn URL</Label>
        <Input id="linkedin" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="github">GitHub URL</Label>
          <Input id="github" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="portfolio">Portfolio URL</Label>
          <Input id="portfolio" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
        Save Profile
      </Button>
    </form>
  )
}
