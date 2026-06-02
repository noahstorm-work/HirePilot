"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, MoreHorizontal } from "lucide-react"
import type { Application, ApplicationStatus } from "@/types"

interface Props {
  saved: Application[]
  applied: Application[]
  interview: Application[]
  offer: Application[]
  rejected: Application[]
}

const columns: { key: ApplicationStatus; label: string; color: string }[] = [
  { key: "Saved", label: "Saved", color: "bg-gray-100 text-gray-700" },
  { key: "Applied", label: "Applied", color: "bg-blue-100 text-blue-700" },
  { key: "Interview", label: "Interview", color: "bg-amber-100 text-amber-700" },
  { key: "Offer", label: "Offer", color: "bg-green-100 text-green-700" },
  { key: "Rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
]

function ApplicationCard({ app }: { app: Application }) {
  const [status, setStatus] = useState(app.status)
  const router = useRouter()
  const supabase = createClient()

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    setStatus(newStatus)
    await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", app.id)
    router.refresh()
  }

  const nextStatus: Record<ApplicationStatus, ApplicationStatus | null> = {
    Saved: "Applied",
    Applied: "Interview",
    Interview: "Offer",
    Offer: null,
    Rejected: null,
  }

  const prevStatus: Record<ApplicationStatus, ApplicationStatus | null> = {
    Saved: null,
    Applied: "Saved",
    Interview: "Applied",
    Offer: "Interview",
    Rejected: "Applied",
  }

  return (
    <div className="p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      <Link href={`/applications/${app.id}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-xs font-semibold text-violet-600">
            {app.company.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{app.company}</p>
            <p className="text-xs text-gray-500 truncate">{app.role_title}</p>
          </div>
        </div>
      </Link>

      {app.match_score !== null && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-violet-500"
              style={{ width: `${app.match_score}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{app.match_score}%</span>
        </div>
      )}

      <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {prevStatus[status] && (
          <button
            onClick={() => handleStatusChange(prevStatus[status]!)}
            className="text-xs text-gray-400 hover:text-gray-600 px-1"
          >
            ←
          </button>
        )}
        <span className="text-[10px] text-gray-400 flex-1 text-center">{status}</span>
        {nextStatus[status] && (
          <button
            onClick={() => handleStatusChange(nextStatus[status]!)}
            className="text-xs text-gray-400 hover:text-gray-600 px-1"
          >
            →
          </button>
        )}
      </div>
    </div>
  )
}

export function KanbanBoard({ saved, applied, interview, offer, rejected }: Props) {
  const columnData: Record<ApplicationStatus, Application[]> = {
    Saved: saved,
    Applied: applied,
    Interview: interview,
    Offer: offer,
    Rejected: rejected,
  }

  return (
    <div className="grid grid-cols-5 gap-4">
      {columns.map((col) => (
        <div key={col.key}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-medium px-2 py-1 rounded ${col.color}`}>
              {col.label}
            </span>
            <span className="text-xs text-gray-400">{columnData[col.key].length}</span>
          </div>
          <div className="space-y-2 min-h-[200px]">
            {columnData[col.key].map((app) => (
              <ApplicationCard key={app.id} app={app} />
            ))}
            {columnData[col.key].length === 0 && (
              <div className="text-center py-8 text-xs text-gray-300">
                No applications
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
