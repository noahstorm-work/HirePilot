"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, ChevronLeft, ChevronRight, Search as SearchIcon, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ErrorLog {
  id: string
  level: string
  message: string
  stack?: string
  user_id?: string
  url?: string
  metadata?: Record<string, unknown>
  created_at: string
}

interface ErrorLogsResponse {
  logs: ErrorLog[]
  total: number
  page: number
  limit: number
}

const LEVEL_VARIANTS: Record<string, "destructive" | "warning" | "default" | "primary"> = {
  error: "destructive",
  warn: "warning",
  info: "default",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function AdminErrorsClient() {
  const [data, setData] = useState<ErrorLogsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [level, setLevel] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "50")
      if (level && level !== "all") params.set("level", level)
      if (debouncedSearch) params.set("search", debouncedSearch)
      try {
        const res = await fetch(`/api/admin/errors?${params}`)
        const json = await res.json()
        if (mounted && json.success) setData(json.data)
      } catch (err) {
        console.error("Failed to fetch error logs:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [page, level, debouncedSearch, refreshKey])

  useEffect(() => {
    const interval = setInterval(() => {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "50")
      if (level && level !== "all") params.set("level", level)
      if (debouncedSearch) params.set("search", debouncedSearch)
      fetch(`/api/admin/errors?${params}`).then(r => r.json()).then(json => {
        if (json.success) setData(json.data)
      }).catch(() => {})
    }, 30_000)
    return () => clearInterval(interval)
  }, [page, level, debouncedSearch])

  useEffect(() => {
    setPage(1) // eslint-disable-line react-hooks/set-state-in-effect
  }, [level, debouncedSearch])

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-[var(--color-accent-rose)]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[var(--color-text-primary)] font-[family-name:var(--font-display)]">
              Error Logs
            </h1>
            <p className="text-xs text-[var(--color-text-muted)]">
              {data ? `${data.total} total entries` : "Loading..."}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setRefreshKey(k => k + 1)}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warn">Warn</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && !data ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] animate-pulse"
            />
          ))}
        </div>
      ) : data && data.logs.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No error logs found"
          description="No log entries match your current filters."
        />
      ) : data ? (
        <>
          <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)]">Time</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)]">Level</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)]">Message</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)]">URL</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[var(--color-text-muted)]">User</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-[var(--color-border-subtle)] last:border-b-0 hover:bg-[var(--color-bg-elevated)]/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={LEVEL_VARIANTS[log.level] || "default"}>
                        {log.level}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)] max-w-md truncate">
                      {log.message}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] max-w-[200px] truncate">
                      {log.url || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                      {log.user_id ? log.user_id.slice(0, 8) + "…" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--color-text-muted)]">
              Page {data.page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
