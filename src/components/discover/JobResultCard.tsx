"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, BookmarkPlus, Check } from "lucide-react"
import type { JobSearchResult } from "@/lib/jobs-api"

interface Props {
  job: JobSearchResult
  isSaved: boolean
  onSave: (job: JobSearchResult) => void
}

export function JobResultCard({ job, isSaved, onSave }: Props) {
  return (
    <div className="group p-5 rounded-xl border border-[#1e1e24] bg-[#0f0f12] hover:border-[#27272f] transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-[#fafafa] font-[family-name:var(--font-display)] truncate">{job.role_title}</h3>
            <Badge variant="outline" className="text-xs shrink-0">{job.source}</Badge>
          </div>
          <p className="text-sm text-[#a0a0ab] mb-1">{job.company}</p>
          <p className="text-xs text-[#45454e] mb-2">
            {job.location}
            {job.salary_min && job.salary_max ? ` · ${job.salary_currency}${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : ""}
            {job.remote_type ? ` · ${job.remote_type}` : ""}
          </p>
          <p className="text-xs text-[#63636e] line-clamp-2">{job.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={isSaved ? "secondary" : "outline"}
            size="sm"
            onClick={() => onSave(job)}
            className="h-8 w-8 p-0"
          >
            {isSaved ? <Check className="h-4 w-4 text-violet-400" /> : <BookmarkPlus className="h-4 w-4" />}
          </Button>
          <a href={job.url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#63636e] hover:text-[#a0a0ab]">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
