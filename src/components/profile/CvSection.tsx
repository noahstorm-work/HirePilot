"use client"

import { Label } from "@/components/ui/label"
import { DocumentUpload } from "@/components/ui/document-upload"
import type { ExtractedMetadata } from "@/lib/document-parser"
import dynamic from "next/dynamic"

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((m) => ({ default: m.RichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] animate-pulse" />
    ),
  }
)

interface CvSectionProps {
  cvText: string
  setCvText: (v: string) => void
  fillFromMetadata: (meta: ExtractedMetadata) => void
  scheduleAutoSave: () => void
}

export function CvSection({ cvText, setCvText, fillFromMetadata, scheduleAutoSave }: CvSectionProps) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)]">CV / Resume</Label>
        <DocumentUpload
          onTextExtracted={(text, meta) => {
            setCvText(text.replace(/\n/g, "<br>"))
            if (meta) fillFromMetadata(meta)
          }}
          label="Upload CV"
        />
      </div>
      <RichTextEditor
        value={cvText}
        onChange={(v) => {
          setCvText(v)
          scheduleAutoSave()
        }}
        placeholder="Paste your CV text here..."
      />
    </div>
  )
}