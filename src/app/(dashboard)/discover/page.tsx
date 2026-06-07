"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Search, MapPin, Briefcase, ExternalLink, Bookmark, BookmarkCheck, Trash2, Plus, Clock, X, Link as LinkIcon, ChevronDown, Send, Mail } from "lucide-react"
import { LocationAutocomplete } from "@/components/ui/location-autocomplete"
import { PasteUrlDialog } from "@/components/discover/PasteUrlDialog"
import { toast } from "sonner"
import type { JobSearchResult } from "@/lib/jobs"
import { formatSalary } from "@/lib/jobs"
import { triggerAnalysis } from "@/lib/trigger-analysis"
import type { SavedJob } from "@/types"

const SEARCH_STATE_KEY = "discover_search_state"

const SOURCE_COLORS: Record<string, string> = {
  adzuna: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  jooble: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  jsearch: "bg-purple-500/10 text-purple-400 border-purple-500/20",
}

const SOURCE_LABELS: Record<string, string> = {
  adzuna: "Adzuna",
  jooble: "Jooble",
  jsearch: "JSearch",
}

export default function DiscoverPage() {
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [results, setResults] = useState<JobSearchResult[]>([])
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searched, setSearched] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showRecent, setShowRecent] = useState(false)
  const [activeSources, setActiveSources] = useState<string[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const recentDropdownRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadSavedJobs()
    const stored = localStorage.getItem("recentJobSearches")
    if (stored) setRecentSearches(JSON.parse(stored))
    const savedState = localStorage.getItem(SEARCH_STATE_KEY)
    if (savedState) {
      try {
        const { query: q, location: l } = JSON.parse(savedState)
        if (q) setQuery(q)
        if (l) setLocation(l)
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(SEARCH_STATE_KEY, JSON.stringify({ query, location }))
  }, [query, location])

  const loadSavedJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from("saved_jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    if (data) setSavedJobs(data as SavedJob[])
  }

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 8)
    setRecentSearches(updated)
    localStorage.setItem("recentJobSearches", JSON.stringify(updated))
  }

  const handleSearch = async (pageNum = 1) => {
    if (!query.trim()) return
    if (pageNum === 1) {
      saveRecentSearch(query.trim())
      setShowRecent(false)
      setLoading(true)
      setResults([])
    } else {
      setLoadingMore(true)
    }
    setSearched(true)
    setPage(pageNum)
    try {
      const params = new URLSearchParams({ query: query.trim(), page: String(pageNum) })
      if (location) params.set("location", location)
      if (activeSources.length > 0) params.set("sources", activeSources.join(","))
      const res = await fetch(`/api/jobs/search?${params}`)
      const json = await res.json()
      if (json.success) {
        setTotal(json.data.total || 0)
        setResults((prev) => pageNum === 1 ? json.data.results : [...prev, ...json.data.results])
      }
    } catch (err) { console.error("Job search error:", err) }
    setLoading(false)
    setLoadingMore(false)
  }

  const handleLoadMore = () => {
    handleSearch(page + 1)
  }

  const handleClearRecent = (term: string) => {
    const updated = recentSearches.filter((s) => s !== term)
    setRecentSearches(updated)
    localStorage.setItem("recentJobSearches", JSON.stringify(updated))
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        recentDropdownRef.current &&
        !recentDropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowRecent(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSave = async (job: JobSearchResult) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (savedJobs.some((s) => s.external_id === job.external_id)) return
    const { data } = await supabase.from("saved_jobs").insert({
      user_id: user.id, external_id: job.external_id, company: job.company,
      role_title: job.role_title, job_url: job.url, description: job.description,
      salary: job.salary_min ? `${job.salary_currency}${job.salary_min.toLocaleString()}${job.salary_max ? ` - ${job.salary_max.toLocaleString()}` : ""}` : null,
      location: job.location, source: job.source,
    }).select().single()
    if (data) { setSavedJobs((prev) => [data as SavedJob, ...prev]); toast.success("Job saved") }
  }

  const handleRemoveSaved = async (id: string) => {
    await supabase.from("saved_jobs").delete().eq("id", id)
    setSavedJobs((prev) => prev.filter((s) => s.id !== id))
    toast.success("Job removed")
  }

  const handleSaveAsApplication = async (saved: SavedJob) => {
    const res = await fetch("/api/applications/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: saved.company, role_title: saved.role_title, job_url: saved.job_url, job_description: saved.description, application_source: saved.source, status: "Saved" }),
    })
    const json = await res.json()
    if (json.success) {
      setSavedJobs((prev) => prev.filter((s) => s.id !== saved.id))
      if (json.data?.id && saved.description) {
        triggerAnalysis(json.data.id, saved.description, saved.company, saved.role_title)
      }
      if (saved.job_url) window.open(saved.job_url, "_blank", "noopener,noreferrer")
      toast.success(`Added ${saved.company} to pipeline`, {
        description: saved.job_url ? "Job opened — submit your application on their site" : "Analysis running",
      })
    } else {
      toast.error("Failed to add to applications")
    }
  }

  const handleQuickApply = async (job: JobSearchResult) => {
    const salary = job.salary_min ? `${job.salary_currency}${job.salary_min.toLocaleString()}${job.salary_max ? ` - ${job.salary_max.toLocaleString()}` : ""}` : null
    const res = await fetch("/api/applications/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: job.company,
        role_title: job.role_title,
        job_url: job.url,
        job_description: job.description,
        application_source: job.source,
        salary_range: salary,
        location: job.location,
        status: "Applied",
      }),
    })
    const json = await res.json()
    if (json.success) {
      if (json.data?.id) {
        triggerAnalysis(json.data.id, job.description, job.company, job.role_title)
        if (job.apply_email) {
          fetch("/api/applications/apply-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              application_id: json.data.id,
              to_email: job.apply_email,
              company: job.company,
              role_title: job.role_title,
            }),
          })
        }
      }
      window.open(job.url, "_blank", "noopener,noreferrer")
      toast.success(`Added ${job.company} to pipeline`, {
        description: job.apply_email
          ? `Application email sent to ${job.apply_email} — job site also opened`
          : "Job opened in a new tab — submit your application on their site",
      })
    } else {
      toast.error(json.error || "Failed to apply")
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Discover Jobs"
        description="Search or paste a job URL to get started"
        icon={<Search className="h-4 w-4 text-[var(--color-accent-blue)]" />}
      />

      {/* Search */}
      <div className="p-5 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            <Input
              ref={searchInputRef}
              placeholder="Job title, skills, or keywords..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowRecent(false) }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => { if (!query && recentSearches.length > 0) setShowRecent(true) }}
              className="pl-9 bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] h-10 text-sm"
            />
            {showRecent && recentSearches.length > 0 && (
              <div ref={recentDropdownRef} className="absolute z-50 w-full mt-1.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] shadow-lg overflow-hidden">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Recent searches</p>
                {recentSearches.map((term) => (
                  <div key={term} className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-bg-hover)] group">
                    <Clock className="h-3 w-3 text-[var(--color-text-muted)] shrink-0" />
                    <button
                      onClick={() => { setQuery(term); setShowRecent(false); searchInputRef.current?.focus() }}
                      className="flex-1 text-left text-sm text-[var(--color-text-secondary)] truncate"
                    >
                      {term}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleClearRecent(term) }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-accent-rose)]"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <LocationAutocomplete
            value={location}
            onChange={setLocation}
            placeholder="Location"
            className="w-full sm:w-52"
          />
          <Button onClick={() => handleSearch()} disabled={loading || !query.trim()} className="gradient-violet text-white border-0 h-10 px-5 text-sm font-semibold hover:opacity-90 shadow-glow">
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Search"}
          </Button>
          <PasteUrlDialog />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        {/* Results */}
        <div className="space-y-2.5 min-w-0">
          {loading ? (
            <LoadingScreen />
          ) : searched && results.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--color-text-muted)]">No jobs found. Try a different search.</div>
          ) : results.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-[var(--color-text-muted)]">{total.toLocaleString()} jobs found</p>
                <div className="flex items-center gap-1.5">
                  {(["adzuna", "jooble", "jsearch"] as const).map((source) => (
                    <button
                      key={source}
                      onClick={() => {
                        setActiveSources((prev) =>
                          prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
                        )
                      }}
                      className={`px-2 py-0.5 rounded-full text-[10px] border transition-all ${
                        activeSources.length === 0 || activeSources.includes(source)
                          ? SOURCE_COLORS[source]
                          : "bg-transparent text-[var(--color-text-muted)] border-[var(--color-border-subtle)] opacity-40"
                      }`}
                    >
                      {SOURCE_LABELS[source]}
                    </button>
                  ))}
                </div>
              </div>
              {results.map((job, i) => {
                const isSaved = savedJobs.some((s) => s.external_id === job.external_id)
                const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.location)
                return (
                  <a
                    key={`${job.external_id}-${i}`}
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
                        <Button variant="ghost" size="sm" onClick={() => handleQuickApply(job)} className="h-7 px-2 text-[10px] font-medium text-[var(--color-accent-violet)] hover:text-white hover:bg-[var(--color-accent-violet)]/20 gap-1">
                          <Send className="h-3 w-3" /> Apply
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSave(job)} disabled={isSaved} className="h-7 w-7 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-accent-violet)]">
                          {isSaved ? <BookmarkCheck className="h-3.5 w-3.5 text-[var(--color-accent-violet)]" /> : <Bookmark className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </a>
                )
              })}
              {results.length < total && (
                <div className="flex justify-center pt-2">
                  <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline" size="sm" className="border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] text-xs">
                    {loadingMore ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent-violet)] border-t-transparent mr-1.5" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                    {loadingMore ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-[var(--color-text-muted)]">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Search for jobs to get started</p>
            </div>
          )}
        </div>

        {/* Saved Jobs */}
        <div className="lg:sticky lg:top-8 self-start">
          <div className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
            <h3 className="text-xs font-medium text-[var(--color-text-secondary)] mb-3 flex items-center gap-2">
              <Bookmark className="h-3.5 w-3.5 text-[var(--color-accent-violet)]" />
              Saved Jobs
            </h3>
            {savedJobs.length === 0 ? (
              <p className="text-[10px] text-[var(--color-text-muted)] text-center py-4">No saved jobs yet</p>
            ) : (
              <div className="space-y-2">
                {savedJobs.map((saved) => (
                  <div key={saved.id} className="p-2.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] group/item">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-[var(--color-text-primary)] truncate">{saved.role_title}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] truncate">{saved.company}</p>
                      </div>
                      <button onClick={() => handleRemoveSaved(saved.id)} className="shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <Trash2 className="h-2.5 w-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent-rose)]" />
                      </button>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-1.5 h-6 text-[10px] w-full text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]" onClick={() => handleSaveAsApplication(saved)}>
                      <Plus className="h-2.5 w-2.5 mr-1" /> Add to Applications
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
