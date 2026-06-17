"use client"

import { useState } from "react"
import { FileText, MessageSquare, Code } from "lucide-react"

export interface CoverLetterTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  promptModifier: string
}

export const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Formal, traditional tone suitable for corporate roles",
    icon: FileText,
    promptModifier: "Write in a formal, professional tone. Use structured paragraphs and traditional business letter format.",
  },
  {
    id: "conversational",
    name: "Conversational",
    description: "Friendly, approachable tone for startups and modern companies",
    icon: MessageSquare,
    promptModifier: "Write in a warm, conversational tone. Show personality while remaining professional. Use shorter paragraphs.",
  },
  {
    id: "technical",
    name: "Technical",
    description: "Focus on technical skills and project details for engineering roles",
    icon: Code,
    promptModifier: "Emphasize technical skills, specific technologies, and project contributions. Be precise and data-driven.",
  },
]

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
            const Icon = template.icon
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
