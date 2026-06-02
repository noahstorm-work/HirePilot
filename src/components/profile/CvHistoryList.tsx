"use client"

import { Badge } from "@/components/ui/badge"
import type { CvVersion } from "@/types"

interface Props {
  versions: CvVersion[]
  activeVersionId?: string | null
}

export function CvHistoryList({ versions, activeVersionId }: Props) {
  if (versions.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-4">No CV versions yet</p>
  }

  return (
    <div className="space-y-2">
      {versions.map((v) => (
        <div
          key={v.id}
          className={`p-3 rounded-xl border transition-colors ${
            v.id === activeVersionId
              ? "border-violet-200 bg-violet-50"
              : "border-gray-100 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900">{v.version_label}</span>
            {v.id === activeVersionId && (
              <Badge variant="primary" className="text-[10px]">Active</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{v.application_count} applications</span>
            <span>{v.interview_count} interviews</span>
            {v.application_count > 0 && (
              <span className="text-violet-600 font-medium">
                {Math.round((v.interview_count / v.application_count) * 100)}% interview rate
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
