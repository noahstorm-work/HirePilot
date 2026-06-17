"use client"

import { useState } from "react"
import { FileText, MessageSquare, Code } from "lucide-react"
import { COVER_LETTER_TEMPLATES } from "@/lib/cover-letter-templates"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  professional: FileText,
  conversational: MessageSquare,
  technical: Code,
}

interface TemplatesPanelProps {
  selectedTemplate: string
  onSelect: (templateId: string) => void
}

export function TemplatesPanel({ selectedTemplate, onSelect }: TemplatesPanelProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
      >
        <FileText className="h-3 w-3" />
        <span>Template: {COVER_LETTER_TEMPLATES.find((t) => t.id === selectedTemplate)?.name || "Professional"}</span>
        <span className="text-[9px]">{expanded ? "▲" : "▼"}</span>
      </button>
      {expanded && (
        <div className="grid grid-cols-3 gap-2">
          {COVER_LETTER_TEMPLATES.map((template) => {
            const Icon = ICON_MAP[template.id] || FileText
            const isSelected = selectedTemplate === template.id
            return (
              <button
                key={template.id}
                onClick={() => { onSelect(template.id); setExpanded(false) }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-[var(--color-accent-violet)]/50 bg-[var(--color-accent-violet)]/5"
                    : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] bg-[var(--color-bg-elevated)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-3 w-3 ${isSelected ? "text-[var(--color-accent-violet)]" : "text-[var(--color-text-muted)]"}`} />
                  <span className={`text-[11px] font-medium ${isSelected ? "text-[var(--color-accent-violet)]" : "text-[var(--color-text-secondary)]"}`}>{template.name}</span>
                </div>
                <p className="text-[9px] text-[var(--color-text-muted)]">{template.description}</p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
