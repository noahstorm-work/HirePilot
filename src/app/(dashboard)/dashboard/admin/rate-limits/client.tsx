"use client"

import { Shield, Clock, Zap, AlertTriangle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SectionHeader } from "@/components/ui/section-header"
import { MetricCard } from "@/components/ui/metric-card"

interface RateLimitEntry {
  endpoint: string
  method: string
  maxRequests: number
  windowMs: number
  category: string
  keyPrefix: string
}

const RATE_LIMIT_CONFIG: RateLimitEntry[] = [
  { endpoint: "/api/ai/career-analysis", method: "POST", maxRequests: 5, windowMs: 60_000, category: "AI", keyPrefix: "ai:career" },
  { endpoint: "/api/ai/analyze-job", method: "POST", maxRequests: 10, windowMs: 60_000, category: "AI", keyPrefix: "ai:match" },
  { endpoint: "/api/ai/cv-improve", method: "POST", maxRequests: 5, windowMs: 60_000, category: "AI", keyPrefix: "ai:cv" },
  { endpoint: "/api/ai/interview-coach", method: "POST", maxRequests: 10, windowMs: 60_000, category: "AI", keyPrefix: "ai:interview" },
  { endpoint: "/api/ai/rejection-analysis", method: "POST", maxRequests: 5, windowMs: 60_000, category: "AI", keyPrefix: "ai:rejection" },
  { endpoint: "/api/ai/generate-followup", method: "POST", maxRequests: 10, windowMs: 60_000, category: "AI", keyPrefix: "ai:followup" },
  { endpoint: "/api/ai/weekly-reports", method: "POST", maxRequests: 3, windowMs: 60_000, category: "AI", keyPrefix: "ai:weekly" },
  { endpoint: "/api/applications/create", method: "POST", maxRequests: 20, windowMs: 60_000, category: "Applications", keyPrefix: "app:create" },
  { endpoint: "/api/applications/list", method: "GET", maxRequests: 30, windowMs: 60_000, category: "Applications", keyPrefix: "app:list" },
  { endpoint: "/api/applications/[id]", method: "GET", maxRequests: 60, windowMs: 60_000, category: "Applications", keyPrefix: "app:get" },
  { endpoint: "/api/applications/[id]", method: "PATCH", maxRequests: 30, windowMs: 60_000, category: "Applications", keyPrefix: "app:patch" },
  { endpoint: "/api/applications/[id]", method: "DELETE", maxRequests: 20, windowMs: 60_000, category: "Applications", keyPrefix: "app:delete" },
  { endpoint: "/api/applications/[id]/status", method: "PATCH", maxRequests: 30, windowMs: 60_000, category: "Applications", keyPrefix: "app:status" },
  { endpoint: "/api/applications/apply-email", method: "POST", maxRequests: 5, windowMs: 60_000, category: "Applications", keyPrefix: "email" },
  { endpoint: "/api/jobs/search", method: "GET", maxRequests: 20, windowMs: 60_000, category: "Jobs", keyPrefix: "search" },
  { endpoint: "/api/jobs/paste-url", method: "POST", maxRequests: 10, windowMs: 60_000, category: "Jobs", keyPrefix: "paste-url" },
  { endpoint: "/api/account", method: "DELETE", maxRequests: 1, windowMs: 60_000, category: "Account", keyPrefix: "account-delete" },
  { endpoint: "/api/account/change-password", method: "POST", maxRequests: 3, windowMs: 60_000, category: "Account", keyPrefix: "pwd" },
  { endpoint: "/api/account/export", method: "GET", maxRequests: 3, windowMs: 60_000, category: "Account", keyPrefix: "export" },
  { endpoint: "/api/account/update-metadata", method: "POST", maxRequests: 10, windowMs: 60_000, category: "Account", keyPrefix: "account-update" },
  { endpoint: "/api/error-log", method: "POST", maxRequests: 30, windowMs: 60_000, category: "Utility", keyPrefix: "error-log" },
  { endpoint: "/api/feedback", method: "POST", maxRequests: 5, windowMs: 60_000, category: "Utility", keyPrefix: "feedback" },
  { endpoint: "/api/locations/search", method: "GET", maxRequests: 30, windowMs: 60_000, category: "Utility", keyPrefix: "loc" },
  { endpoint: "/api/autocomplete/companies", method: "GET", maxRequests: 30, windowMs: 60_000, category: "Utility", keyPrefix: "ac:co" },
  { endpoint: "/api/autocomplete/roles", method: "GET", maxRequests: 30, windowMs: 60_000, category: "Utility", keyPrefix: "ac:role" },
  { endpoint: "/api/admin/errors", method: "GET", maxRequests: 30, windowMs: 60_000, category: "Admin", keyPrefix: "admin:errors" },
]

const CATEGORY_COLORS: Record<string, string> = {
  AI: "text-[var(--color-accent-violet)]",
  Applications: "text-[var(--color-accent-blue)]",
  Jobs: "text-[var(--color-accent-emerald)]",
  Account: "text-[var(--color-accent-amber)]",
  Utility: "text-[var(--color-text-muted)]",
  Admin: "text-[var(--color-accent-rose)]",
}

const CATEGORY_BADGES: Record<string, "primary" | "default" | "warning" | "destructive"> = {
  AI: "primary",
  Applications: "default",
  Jobs: "default",
  Account: "warning",
  Utility: "default",
  Admin: "destructive",
}

function formatWindow(ms: number): string {
  if (ms >= 60_000) return `${ms / 60_000} min`
  if (ms >= 1_000) return `${ms / 1_000}s`
  return `${ms}ms`
}

export function RateLimitsClient() {
  const categories = [...new Set(RATE_LIMIT_CONFIG.map((r) => r.category))]

  const totalEndpoints = RATE_LIMIT_CONFIG.length
  const aiEndpoints = RATE_LIMIT_CONFIG.filter((r) => r.category === "AI").length
  const lowestLimit = Math.min(...RATE_LIMIT_CONFIG.map((r) => r.maxRequests))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="Rate Limits"
          description="API rate limit configuration for all endpoints"
          icon={<Shield className="h-4 w-4 text-[var(--color-accent-violet)]" />}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <MetricCard icon={Zap} label="Total Endpoints" value={totalEndpoints} color="text-[var(--color-accent-blue)]" />
        <MetricCard icon={AlertTriangle} label="AI Endpoints" value={aiEndpoints} color="text-[var(--color-accent-violet)]" />
        <MetricCard icon={Clock} label="Window" value="60s" color="text-[var(--color-accent-emerald)]" />
        <MetricCard icon={Shield} label="Lowest Limit" value={`${lowestLimit}/min`} color="text-[var(--color-accent-amber)]" />
      </div>

      <div className="surface-card p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]/50">
        <div className="flex items-start gap-2.5">
          <Info className="h-4 w-4 text-[var(--color-accent-blue)] mt-0.5 shrink-0" />
          <div className="text-xs text-[var(--color-text-secondary)] space-y-1">
            <p className="font-medium text-[var(--color-text-primary)]">How Rate Limiting Works</p>
            <p>
              Rate limits are enforced per-user using an in-memory sliding window. Each endpoint has a maximum number of
              requests allowed within a 60-second window. When exceeded, the API returns a <code className="px-1 py-0.5 rounded bg-[var(--color-bg-hover)] text-[var(--color-accent-rose)]">429</code> status with a retry-after hint.
            </p>
            <p>
              The rate limit state is per-server-instance and resets on server restart. In a multi-instance deployment
              (e.g., Vercel serverless), each instance maintains its own counter.
            </p>
          </div>
        </div>
      </div>

      {categories.map((category) => {
        const entries = RATE_LIMIT_CONFIG.filter((r) => r.category === category)
        return (
          <div key={category} className="surface-card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <h3 className={`text-sm font-semibold font-[family-name:var(--font-display)] ${CATEGORY_COLORS[category]}`}>
                {category}
              </h3>
              <Badge variant={CATEGORY_BADGES[category]}>{entries.length} endpoints</Badge>
            </div>
            <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Endpoint</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Method</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Limit</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Window</th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Key Prefix</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={`${entry.method}-${entry.endpoint}`}
                      className="border-b border-[var(--color-border-subtle)] last:border-b-0 hover:bg-[var(--color-bg-elevated)]/50 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-xs text-[var(--color-text-secondary)] font-mono">
                        {entry.endpoint}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant={entry.method === "POST" ? "primary" : entry.method === "DELETE" ? "destructive" : "default"}>
                          {entry.method}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-xs font-bold font-[family-name:var(--font-mono)] text-[var(--color-text-primary)]">
                        {entry.maxRequests}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-[var(--color-text-muted)]">
                        {formatWindow(entry.windowMs)}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-[var(--color-text-muted)] font-mono">
                        {entry.keyPrefix}:
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
