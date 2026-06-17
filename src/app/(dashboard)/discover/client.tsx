"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingSkeleton } from "@/components/ui/loading-screen"
import { Search, ChevronDown, Zap, Globe, Lightbulb } from "lucide-react"
import { toast } from "sonner"
import { logError } from "@/lib/error-service"
import type { JobSearchResult } from "@/lib/jobs"
import { triggerAnalysis } from "@/lib/trigger-analysis"
import type { SavedJob } from "@/types"
import { SearchBar } from "@/components/discover/SearchBar"
import { JobResultCard } from "@/components/discover/JobResultCard"
import { SavedJobsSidebar } from "@/components/discover/SavedJobsSidebar"
import { SOURCE_COLORS, SOURCE_LABELS } from "@/components/discover/source-labels"
import { calculateSkillMatch } from "@/lib/skill-match"

const SEARCH_STATE_KEY = "discover_search_state"

export function DiscoverClient() {
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [results, setResults] = useState<JobSearchResult[]>([])
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [userSkills, setUserSkills] = useState<string[]>([])
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
    let mounted = true
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [savedRes, profileRes] = await Promise.all([
        supabase.from("saved_jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("user_profiles").select("skills").eq("id", user.id).single(),
      ])
      if (mounted && savedRes.data) setSavedJobs(savedRes.data as SavedJob[])
      if (mounted && profileRes.data?.skills) setUserSkills(profileRes.data.skills)
      const stored = localStorage.getItem("recentJobSearches")
      if (mounted && stored) setRecentSearches(JSON.parse(stored))
      const savedState = localStorage.getItem(SEARCH_STATE_KEY)
      if (savedState) {
        try {
          const { query: q, location: l } = JSON.parse(savedState)
          if (mounted && q) setQuery(q)
          if (mounted && l) setLocation(l)
        } catch {}
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(SEARCH_STATE_KEY, JSON.stringify({ query, location }))
    }, 500)
    return () => clearTimeout(timeout)
  }, [query, location])

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 8)
    setRecentSearches(updated)
    localStorage.setItem("recentJobSearches", JSON.stringify(updated))
  }

  const handleSearch = useCallback(async (pageNum = 1) => {
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
    } catch (err) { logError("Job search failed", err instanceof Error ? err.message : String(err), "discover-search") }
    setLoading(false)
    setLoadingMore(false)
  }, [query, location, activeSources])

  const handleLoadMore = useCallback(() => {
    handleSearch(page + 1)
  }, [handleSearch, page])

  const handleClearRecent = useCallback((term: string) => {
    const updated = recentSearches.filter((s) => s !== term)
    setRecentSearches(updated)
    localStorage.setItem("recentJobSearches", JSON.stringify(updated))
  }, [recentSearches])

  const handleSelectRecent = useCallback((term: string) => {
    setQuery(term)
    setShowRecent(false)
    searchInputRef.current?.focus()
  }, [])

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

  const handleSave = useCallback(async (job: JobSearchResult) => {
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
  }, [supabase, savedJobs])

  const handleRemoveSaved = useCallback(async (id: string) => {
    const removed = savedJobs.find((s) => s.id === id)
    setSavedJobs((prev) => prev.filter((s) => s.id !== id))
    const { error } = await supabase.from("saved_jobs").delete().eq("id", id)
    if (error) {
      toast.error("Failed to remove job")
      if (removed) setSavedJobs((prev) => [...prev, removed].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    } else {
      toast.success("Job removed")
    }
  }, [supabase, savedJobs])

  const handleSaveAsApplication = useCallback(async (saved: SavedJob) => {
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
  }, [])

  const handleQuickApply = useCallback(async (job: JobSearchResult) => {
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
          }).catch(() => { logError("Quick apply email failed", "Email send failed", "discover-quick-apply") })
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
  }, [])

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Discover Jobs"
        description="Search or paste a job URL to get started"
        icon={<Search className="h-4 w-4 text-[var(--color-accent-blue)]" />}
      />

      <SearchBar
        query={query}
        setQuery={setQuery}
        location={location}
        setLocation={setLocation}
        onSearch={() => handleSearch()}
        loading={loading}
        recentSearches={recentSearches}
        showRecent={showRecent}
        setShowRecent={setShowRecent}
        onSelectRecent={handleSelectRecent}
        onClearRecent={handleClearRecent}
        searchInputRef={searchInputRef}
        recentDropdownRef={recentDropdownRef}
      />

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-2.5 min-w-0">
          {loading ? (
            <LoadingSkeleton rows={4} />
          ) : searched && results.length === 0 ? (
            <EmptyState icon={Search} title="No jobs found" description="Try a different search query or adjust your filters." />
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
                      aria-pressed={activeSources.length === 0 || activeSources.includes(source)}
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
              {results.map((job, i) => (
                <JobResultCard
                  key={`${job.external_id}-${i}`}
                  job={job}
                  isSaved={savedJobs.some((s) => s.external_id === job.external_id)}
                  onSave={handleSave}
                  onQuickApply={handleQuickApply}
                  matchScore={userSkills.length > 0 ? calculateSkillMatch(userSkills, `${job.role_title} ${job.description}`) : undefined}
                />
              ))}
              {results.length < total && (
                <div className="flex justify-center pt-2">
                  <button onClick={handleLoadMore} disabled={loadingMore} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] text-xs hover:bg-[var(--color-bg-hover)] transition-default disabled:opacity-50">
                    {loadingMore ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-accent-violet)] border-t-transparent" /> : <ChevronDown className="h-3 w-3" />}
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-14 w-14 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-[var(--color-text-muted)]" />
              </div>
              <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] font-[family-name:var(--font-display)] mb-1">
                Discover jobs
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] max-w-sm text-center mb-5">
                Search across multiple job boards or paste a listing URL to get AI-powered match analysis.
              </p>

              <div className="w-full max-w-sm space-y-3 mb-5">
                <p className="text-[10px] text-[var(--color-text-muted)] text-center">Try searching for</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {["Software Engineer", "Product Manager", "Data Scientist", "Designer", "DevOps Engineer"].map((term) => (
                    <button
                      key={term}
                      onClick={() => { setQuery(term); searchInputRef.current?.focus() }}
                      className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-violet)]/30 hover:text-[var(--color-accent-violet)] transition-all cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full max-w-sm grid grid-cols-3 gap-2 mb-5">
                {[
                  { icon: Globe, label: "Adzuna", desc: "Global job data" },
                  { icon: Zap, label: "Jooble", desc: "Aggregated listings" },
                  { icon: Search, label: "JSearch", desc: "Indeed + more" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-[var(--color-bg-elevated)]/50 border border-[var(--color-border-subtle)]">
                    <Icon className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
                    <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">{label}</span>
                    <span className="text-[9px] text-[var(--color-text-muted)]">{desc}</span>
                  </div>
                ))}
              </div>

              <div className="w-full max-w-sm p-3 rounded-xl bg-[var(--color-bg-elevated)]/50 border border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb className="h-3 w-3 text-[var(--color-accent-amber)]" />
                  <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">Quick tips</span>
                </div>
                <ul className="space-y-1">
                  {[
                    "Add a location to find remote or nearby roles",
                    "Use specific titles for better results",
                    "Paste a job URL to auto-fill and analyze it",
                  ].map((tip) => (
                    <li key={tip} className="text-[10px] text-[var(--color-text-muted)] flex items-start gap-1.5">
                      <span className="text-[var(--color-accent-violet)] mt-px">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <SavedJobsSidebar
          savedJobs={savedJobs}
          onRemove={handleRemoveSaved}
          onSaveAsApplication={handleSaveAsApplication}
        />
      </div>
    </div>
  )
}
