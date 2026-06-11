"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ExternalLink } from "lucide-react"

interface LinksSectionProps {
  linkedin: string
  setLinkedin: (v: string) => void
  github: string
  setGithub: (v: string) => void
  portfolio: string
  setPortfolio: (v: string) => void
  scheduleAutoSave: () => void
}

export function LinksSection({
  linkedin,
  setLinkedin,
  github,
  setGithub,
  portfolio,
  setPortfolio,
  scheduleAutoSave,
}: LinksSectionProps) {
  return (
    <div className="surface-card p-5 space-y-3.5">
      <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] block">Links</Label>
      <div>
        <Label htmlFor="profile-linkedin" className="text-[10px] text-[var(--color-text-muted)] mb-1 block">
          LinkedIn URL
        </Label>
        <div className="relative">
          <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          <Input
            id="profile-linkedin"
            value={linkedin}
            onChange={(e) => {
              setLinkedin(e.target.value)
              scheduleAutoSave()
            }}
            className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus-visible:border-[var(--color-border-focus)] h-9 text-sm"
            placeholder="https://linkedin.com/in/..."
          />
        </div>
      </div>
      <div>
        <Label htmlFor="profile-github" className="text-[10px] text-[var(--color-text-muted)] mb-1 block">
          GitHub URL
        </Label>
        <div className="relative">
          <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          <Input
            id="profile-github"
            value={github}
            onChange={(e) => {
              setGithub(e.target.value)
              scheduleAutoSave()
            }}
            className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus-visible:border-[var(--color-border-focus)] h-9 text-sm"
            placeholder="https://github.com/..."
          />
        </div>
      </div>
      <div>
        <Label htmlFor="profile-portfolio" className="text-[10px] text-[var(--color-text-muted)] mb-1 block">
          Portfolio URL
        </Label>
        <div className="relative">
          <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          <Input
            id="profile-portfolio"
            value={portfolio}
            onChange={(e) => {
              setPortfolio(e.target.value)
              scheduleAutoSave()
            }}
            className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] focus-visible:border-[var(--color-border-focus)] h-9 text-sm"
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  )
}