"use client"

import { Card, CardContent } from "@/components/ui/card"
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
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900 truncate">{job.role_title}</h3>
              <Badge variant="outline" className="text-xs shrink-0">{job.source}</Badge>
            </div>
            <p className="text-sm text-gray-500 mb-1">{job.company}</p>
            <p className="text-xs text-gray-400 mb-2">
              {job.location}
              {job.salary_min && job.salary_max ? ` · ${job.salary_currency}${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}` : ""}
              {job.remote_type ? ` · ${job.remote_type}` : ""}
            </p>
            <p className="text-xs text-gray-500 line-clamp-2">{job.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={isSaved ? "secondary" : "outline"}
              size="sm"
              onClick={() => onSave(job)}
            >
              {isSaved ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
            </Button>
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
