"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Briefcase, ExternalLink, Bookmark, BookmarkCheck, Trash2, Plus } from "lucide-react"
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
    const { data } = await supabase
      .from("saved_jobs").select("*").eq("user_id", user.id).order("created_at", { ascending: false })
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
    if (data) setSavedJobs((prev) => [data as SavedJob, ...prev])
  }

  const handleRemoveSaved = async (id: string) => {
    await supabase.from("saved_jobs").delete().eq("id", id)
    setSavedJobs((prev) => prev.filter((s) => s.id !== id))
  }

  const handleSaveAsApplication = async (saved: SavedJob) => {
    await fetch("/api/applications/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: saved.company, role_title: saved.role_title, job_url: saved.job_url, job_description: saved.description, application_source: saved.source, status: "Saved" }),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">Discover Jobs</h1>
        <p className="text-sm text-[#63636e] mt-1">Search or paste a job URL to get started</p>
      </div>

      {/* Search Bar */}
      <div className="p-5 rounded-2xl border border-[#1e1e24] bg-[#0f0f12]">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#45454e]" />
            <Input
              placeholder="Job title, skills, or keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e] focus:border-violet-500 focus:ring-violet-500/20 h-11"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#45454e]" />
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 bg-[#16161a] border-[#1e1e24] text-[#fafafa] placeholder:text-[#45454e] focus:border-violet-500 focus:ring-violet-500/20 h-11"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading || !query.trim()} className="gradient-violet text-white border-0 h-11 px-6 font-semibold hover:opacity-90">
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Search"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Results */}
        <div className="space-y-3 min-w-0">
          {loading ? (
            <div className="flex flex-col items-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              <p className="text-sm text-[#63636e] mt-3">Searching jobs...</p>
            </div>
          ) : searched && results.length === 0 ? (
            <div className="text-center py-16 text-sm text-[#63636e]">No jobs found. Try a different search.</div>
          ) : results.length > 0 ? (
            results.map((job, i) => {
              const isSaved = savedJobs.some((s) => s.external_id === job.external_id)
              return (
                <div key={`${job.external_id}-${i}`} className="group p-5 rounded-xl border border-[#1e1e24] bg-[#0f0f12] hover:border-[#27272f] transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold font-[family-name:var(--font-display)] truncate">{job.role_title}</h3>
                      <p className="text-sm text-[#a0a0ab] mt-0.5">{job.company}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#63636e]">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                        {job.salary_min && <span>${job.salary_min.toLocaleString()} - ${job.salary_max?.toLocaleString()}</span>}
                      </div>
                      <p className="text-xs text-[#45454e] mt-2 line-clamp-2">{job.description.slice(0, 200)}...</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(job)}
                        disabled={isSaved}
                        className="h-8 w-8 p-0 text-[#63636e] hover:text-violet-400"
                      >
                        {isSaved ? <BookmarkCheck className="h-4 w-4 text-violet-400" /> : <Bookmark className="h-4 w-4" />}
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
            })
          ) : (
            <div className="text-center py-16 text-[#45454e]">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Search for jobs to get started</p>
            </div>
          )}
        </div>

        {/* Saved Jobs Sidebar */}
        <div className="lg:sticky lg:top-8 self-start">
          <div className="p-5 rounded-2xl border border-[#1e1e24] bg-[#0f0f12]">
            <h3 className="text-sm font-medium text-[#a0a0ab] mb-3 flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-violet-400" />
              Saved Jobs
            </h3>
            {savedJobs.length === 0 ? (
              <p className="text-xs text-[#45454e] text-center py-4">No saved jobs yet</p>
            ) : (
              <div className="space-y-2">
                {savedJobs.map((saved) => (
                  <div key={saved.id} className="p-3 rounded-lg bg-[#16161a] border border-[#1e1e24] group/item">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#fafafa] truncate">{saved.role_title}</p>
                        <p className="text-xs text-[#63636e] truncate">{saved.company}</p>
                      </div>
                      <button onClick={() => handleRemoveSaved(saved.id)} className="shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <Trash2 className="h-3 w-3 text-[#45454e] hover:text-rose-400" />
                      </button>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs w-full text-[#63636e] hover:text-[#a0a0ab] hover:bg-[#1a1a1f]" onClick={() => handleSaveAsApplication(saved)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Move to Applications
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
