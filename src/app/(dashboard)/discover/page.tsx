"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/Navbar"
import { JobSearchBar } from "@/components/discover/JobSearchBar"
import { JobResultCard } from "@/components/discover/JobResultCard"
import { PasteUrlDialog } from "@/components/discover/PasteUrlDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, Trash2 } from "lucide-react"
import Link from "next/link"
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

  useEffect(() => {
    loadSavedJobs()
  }, [])

  const loadSavedJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("saved_jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    if (data) setSavedJobs(data as SavedJob[])
  }

  const handleSearch = async (q: string, loc: string) => {
    setQuery(q)
    setLocation(loc)
    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch(`/api/jobs/search?query=${encodeURIComponent(q)}${loc ? `&location=${encodeURIComponent(loc)}` : ""}`)
      const json = await res.json()
      if (json.success) {
        setResults(json.data.results)
      }
    } catch {}
    setLoading(false)
  }

  const handleSave = async (job: JobSearchResult) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const isSaved = savedJobs.some((s) => s.external_id === job.external_id)
    if (isSaved) return

    const { data } = await supabase.from("saved_jobs").insert({
      user_id: user.id,
      external_id: job.external_id,
      company: job.company,
      role_title: job.role_title,
      job_url: job.url,
      description: job.description,
      salary: job.salary_min ? `${job.salary_currency}${job.salary_min.toLocaleString()}${job.salary_max ? ` - ${job.salary_max.toLocaleString()}` : ""}` : null,
      location: job.location,
      source: job.source,
    }).select().single()

    if (data) {
      setSavedJobs((prev) => [data as SavedJob, ...prev])
    }
  }

  const handleRemoveSaved = async (id: string) => {
    await supabase.from("saved_jobs").delete().eq("id", id)
    setSavedJobs((prev) => prev.filter((s) => s.id !== id))
  }

  const handleSaveAsApplication = async (saved: SavedJob) => {
    await fetch("/api/applications/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: saved.company,
        role_title: saved.role_title,
        job_url: saved.job_url,
        job_description: saved.description,
        application_source: saved.source,
        status: "Saved",
      }),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Discover Jobs</h1>
            <p className="text-sm text-gray-500 mt-1">Search or paste a job URL to get started</p>
          </div>
          <PasteUrlDialog />
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <JobSearchBar onSearch={handleSearch} loading={loading} />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
                <p className="text-sm text-gray-500 mt-2">Searching jobs...</p>
              </div>
            ) : searched && results.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                No jobs found. Try a different search.
              </div>
            ) : results.length > 0 ? (
              results.map((job, i) => (
                <JobResultCard
                  key={`${job.external_id}-${i}`}
                  job={job}
                  isSaved={savedJobs.some((s) => s.external_id === job.external_id)}
                  onSave={handleSave}
                />
              ))
            ) : (
              <div className="text-center py-12 text-sm text-gray-400">
                Search for jobs or paste a URL to get started
              </div>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Saved Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {savedJobs.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No saved jobs yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedJobs.map((saved) => (
                      <div key={saved.id} className="p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">{saved.role_title}</p>
                            <p className="text-xs text-gray-500 truncate">{saved.company}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveSaved(saved.id)}
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 h-7 text-xs w-full"
                          onClick={() => handleSaveAsApplication(saved)}
                        >
                          Move to Applications
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {savedJobs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Link href="/applications">
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        View All Applications
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
