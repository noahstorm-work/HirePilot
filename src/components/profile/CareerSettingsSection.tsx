"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RoleAutocomplete } from "@/components/ui/role-autocomplete"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X } from "lucide-react"

interface CareerSettingsSectionProps {
  targetRole: string
  setTargetRole: (v: string) => void
  yearsExperience: string
  setYearsExperience: (v: string) => void
  targetSeniority: string
  setTargetSeniority: (v: string) => void
  skills: string[]
  setSkills: (v: string[]) => void
  scheduleAutoSave: () => void
}

export function CareerSettingsSection({
  targetRole,
  setTargetRole,
  yearsExperience,
  setYearsExperience,
  targetSeniority,
  setTargetSeniority,
  skills,
  setSkills,
  scheduleAutoSave,
}: CareerSettingsSectionProps) {
  const [skillInput, setSkillInput] = useState("")

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

  return (
    <div className="surface-card p-5 space-y-3.5">
      <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] block">
        Career Settings
      </Label>
      <div>
        <Label htmlFor="profile-target-role" className="text-[10px] text-[var(--color-text-muted)] mb-1 block">
          Target Role
        </Label>
        <RoleAutocomplete
          id="profile-target-role"
          value={targetRole}
          onChange={(v) => {
            setTargetRole(v)
            scheduleAutoSave()
          }}
          placeholder="e.g. Senior Frontend Engineer"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="profile-years" className="text-[10px] text-[var(--color-text-muted)] mb-1 block">
            Years of Experience
          </Label>
          <Input
            id="profile-years"
            type="number"
            min="0"
            max="30"
            value={yearsExperience}
            onChange={(e) => {
              setYearsExperience(e.target.value)
              scheduleAutoSave()
            }}
            className="bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus-visible:border-[var(--color-border-focus)] h-9 text-sm"
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="profile-seniority" className="text-[10px] text-[var(--color-text-muted)] mb-1 block">
            Seniority Level
          </Label>
          <Select
            value={targetSeniority}
            onValueChange={(v) => {
              setTargetSeniority(v)
              scheduleAutoSave()
            }}
          >
            <SelectTrigger id="profile-seniority" className="h-9 text-sm">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="junior">Junior</SelectItem>
              <SelectItem value="mid">Mid</SelectItem>
              <SelectItem value="senior">Senior</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="profile-skills" className="text-[10px] text-[var(--color-text-muted)] mb-1 block">
          Skills
        </Label>
        <div className="flex gap-2">
          <Input
            id="profile-skills"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            className="flex-1 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus-visible:border-[var(--color-border-focus)] h-9 text-sm"
            placeholder="Type a skill and press Enter"
          />
          <Button
            type="button"
            onClick={addSkill}
            variant="outline"
            size="sm"
            className="h-9 px-3 border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]"
          >
            Add
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-[var(--color-accent-violet)]/10 text-[var(--color-accent-violet)] border border-[var(--color-accent-violet)]/20"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  aria-label={`Remove ${skill}`}
                  className="hover:text-[var(--color-accent-rose)] transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}