"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BasicInfoStepProps {
  fullName: string
  setFullName: (v: string) => void
  targetRole: string
  setTargetRole: (v: string) => void
  yearsExperience: string
  setYearsExperience: (v: string) => void
  seniority: string
  setSeniority: (v: string) => void
}

const SENIORITY_LEVELS = [
  "Intern",
  "Junior",
  "Mid-Level",
  "Senior",
  "Staff",
  "Principal",
  "Lead",
  "Manager",
  "Director",
  "VP",
  "C-Level",
]

const COMMON_ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "DevOps Engineer",
  "Data Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "UX Designer",
  "UI Designer",
  "QA Engineer",
  "Engineering Manager",
  "CTO",
  "Technical Lead",
]

export function BasicInfoStep({
  fullName,
  setFullName,
  targetRole,
  setTargetRole,
  yearsExperience,
  setYearsExperience,
  seniority,
  setSeniority,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-5 py-2">
      <div>
        <Label htmlFor="onboard-name" className="text-[11px] font-medium text-[var(--color-text-tertiary)] mb-1.5 block">
          Full Name <span className="text-[var(--color-accent-rose)]">*</span>
        </Label>
        <Input
          id="onboard-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          className="h-9 text-sm"
        />
      </div>

      <div>
        <Label htmlFor="onboard-role" className="text-[11px] font-medium text-[var(--color-text-tertiary)] mb-1.5 block">
          Target Role
        </Label>
        <Input
          id="onboard-role"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Senior Software Engineer"
          list="onboard-roles"
          className="h-9 text-sm"
        />
        <datalist id="onboard-roles">
          {COMMON_ROLES.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] mb-1.5 block">
            Years of Experience
          </Label>
          <Input
            type="number"
            min={0}
            max={50}
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            placeholder="e.g. 5"
            className="h-9 text-sm"
          />
        </div>
        <div>
          <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] mb-1.5 block">
            Seniority Level
          </Label>
          <Select value={seniority} onValueChange={setSeniority}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {SENIORITY_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
