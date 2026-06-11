"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Bookmark, BookmarkCheck, Send, Mail } from "lucide-react"
import { formatSalary } from "@/lib/jobs"
import { SOURCE_COLORS, SOURCE_LABELS } from "@/components/discover/source-labels"
import type { JobSearchResult } from "@/lib/jobs"

interface JobResultCardProps {
  job: JobSearchResult
  isSaved: boolean
  onSave: (job: JobSearchResult) => void
  onQuickApply: (job: JobSearchResult) => void
}

export function JobResultCard({ job, isSaved, onSave, onQuickApply }: JobResultCardProps) {
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.location)

  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-default cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold font-[family-name:var(--font-display)] truncate group-hover:text-[var(--color-accent-violet)] transition-colors">{job.role_title}</h3>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border shrink-0 ${SOURCE_COLORS[job.source]}`}>
              {SOURCE_LABELS[job.source]}
            </span>
            {job.apply_email && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium border shrink-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                <Mail className="h-2.5 w-2.5" /> Email
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{job.company}</p>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{job.location}</span>
            {salary && <span>{salary}</span>}
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5 line-clamp-2">{job.description.slice(0, 180)}...</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.preventDefault()}>
          <Button variant="ghost" size="sm" onClick={() => onQuickApply(job)} className="h-7 px-2 text-[10px] font-medium text-[var(--color-accent-violet)] hover:text-white hover:bg-[var(--color-accent-violet)]/20 gap-1">
            <Send className="h-3 w-3" /> Apply
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onSave(job)} disabled={isSaved} aria-label={isSaved ? "Saved" : "Save job"} className="h-7 w-7 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-accent-violet)]">
            {isSaved ? <BookmarkCheck className="h-3.5 w-3.5 text-[var(--color-accent-violet)]" /> : <Bookmark className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </a>
  )
}
