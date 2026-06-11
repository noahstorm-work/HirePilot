"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { Bookmark, Trash2, Plus } from "lucide-react"
import type { SavedJob } from "@/types"

interface SavedJobsSidebarProps {
  savedJobs: SavedJob[]
  onRemove: (id: string) => void
  onSaveAsApplication: (saved: SavedJob) => void
}

export const SavedJobsSidebar = React.memo(function SavedJobsSidebar({ savedJobs, onRemove, onSaveAsApplication }: SavedJobsSidebarProps) {
  return (
    <div className="lg:sticky lg:top-8 self-start">
      <div className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
        <h3 className="text-xs font-medium text-[var(--color-text-secondary)] mb-3 flex items-center gap-2">
          <Bookmark className="h-3.5 w-3.5 text-[var(--color-accent-violet)]" />
          Saved Jobs
        </h3>
        {savedJobs.length === 0 ? (
          <EmptyState icon={Bookmark} title="No saved jobs" description="Save jobs from search results to track them here." className="py-6" />
        ) : (
          <div className="space-y-2">
            {savedJobs.map((saved) => (
              <div key={saved.id} className="p-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] group/item">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[var(--color-text-primary)] truncate">{saved.role_title}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">{saved.company}</p>
                  </div>
                  <button onClick={() => onRemove(saved.id)} aria-label={`Remove ${saved.role_title} from saved`} className="shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <Trash2 className="h-2.5 w-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent-rose)]" />
                  </button>
                </div>
                <Button variant="ghost" size="sm" className="mt-1.5 h-6 text-[10px] w-full text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]" onClick={() => onSaveAsApplication(saved)}>
                  <Plus className="h-2.5 w-2.5 mr-1" /> Add to Applications
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
