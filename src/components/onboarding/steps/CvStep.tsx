"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, Clipboard } from "lucide-react"

interface CvStepProps {
  cvText: string
  setCvText: (v: string) => void
}

export function CvStep({ cvText, setCvText }: CvStepProps) {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setCvText(text)
    } catch {
      // Clipboard API may fail in some browsers
    }
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-[var(--color-accent-violet)]/10">
          <FileText className="h-4 w-4 text-[var(--color-accent-violet)]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-text-primary)]">Paste Your CV</p>
          <p className="text-[10px] text-[var(--color-text-muted)]">
            Copy your full CV/resume text and paste it below
          </p>
        </div>
      </div>

      <div className="relative">
        <Label htmlFor="onboard-cv" className="text-[11px] font-medium text-[var(--color-text-tertiary)] mb-1.5 block">
          CV / Resume Text
        </Label>
        <Textarea
          id="onboard-cv"
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          placeholder="Paste your CV text here...&#10;&#10;Include your work experience, education, skills, and any other relevant sections."
          className="min-h-[240px] text-sm leading-relaxed"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-[var(--color-text-muted)]">
          {cvText.length > 0 ? `${cvText.split(/\s+/).filter(Boolean).length} words` : "No text yet"}
        </p>
        <button
          type="button"
          onClick={handlePaste}
          className="flex items-center gap-1.5 text-xs text-[var(--color-accent-violet)] hover:text-[var(--color-accent-violet-dim)] transition-colors"
        >
          <Clipboard className="h-3 w-3" />
          Paste from clipboard
        </button>
      </div>

      <div className="p-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
        <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
          <span className="font-medium text-[var(--color-text-secondary)]">Tip:</span>{" "}
          You can skip this step and add your CV later from the Profile page. Adding it now helps our AI give you better insights right away.
        </p>
      </div>
    </div>
  )
}
