"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SectionHeader } from "@/components/ui/section-header"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { Search, MapPin, Briefcase, ExternalLink, Bookmark, BookmarkCheck, Trash2, Plus } from "lucide-react"
import { LocationAutocomplete } from "@/components/ui/location-autocomplete"
import { toast } from "sonner"
import type { JobSearchResult } from "@/lib/jobs-api"
import type { SavedJob } from "@/types"

export default function DiscoverPage() {
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [results, setResults] = useState<JobSearchResult[]>([])
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const supabase = createClient()

  useEffect(() => { loadSavedJobs() }, [])

  const loadSavedJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from("saved_jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
    if (data) setSavedJobs(data as SavedJob[])
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/jobs/search?query=${encodeURIComponent(query)}${location ? `&location=${encodeURIComponent(location)}` : ""}`)
      const json = await res.json()
      if (json.success) setResults(json.data.results)
    } catch {}
    setLoading(false)
  }

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
      toast.success("Added to applications")
    } else {
      toast.error("Failed to add to applications")
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
              placeholder="Job title, skills, or keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 bg-[var(--color-bg-elevated)] border-[var(--color-border-subtle)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-border-focus)] h-10 text-sm"
            />
          </div>
          <LocationAutocomplete
            value={location}
            onChange={setLocation}
            placeholder="Location"
            className="w-full sm:w-52"
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()} className="gradient-violet text-white border-0 h-10 px-5 text-sm font-semibold hover:opacity-90 shadow-glow">
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Search"}
          </Button>
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
            results.map((job, i) => {
              const isSaved = savedJobs.some((s) => s.external_id === job.external_id)
              return (
                <div key={`${job.external_id}-${i}`} className="group p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-default">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold font-[family-name:var(--font-display)] truncate">{job.role_title}</h3>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{job.company}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[var(--color-text-muted)]">
                        <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{job.location}</span>
                        {job.salary_min && <span>${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()}</span>}
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5 line-clamp-2">{job.description.slice(0, 180)}...</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => handleSave(job)} disabled={isSaved} className="h-7 w-7 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-accent-violet)]">
                        {isSaved ? <BookmarkCheck className="h-3.5 w-3.5 text-[var(--color-accent-violet)]" /> : <Bookmark className="h-3.5 w-3.5" />}
                      </Button>
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              )
            })
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
