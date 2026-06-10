import { describe, it, expect } from "vitest"
import type { JobSearchResult } from "@/lib/jobs/types"

// Reimplement the dedup logic from jobs/index.ts for testing
function dedupJobs(jobs: JobSearchResult[]): JobSearchResult[] {
  const seen = new Set<string>()
  return jobs.filter((job) => {
    const key = `${job.role_title.toLowerCase()}_${job.company.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function makeJob(role_title: string, company: string, source: "adzuna" | "jooble" | "jsearch" = "adzuna"): JobSearchResult {
  return {
    external_id: `${source}-${Math.random()}`,
    company,
    role_title,
    description: "Test",
    url: "https://example.com",
    salary_min: null,
    salary_max: null,
    salary_currency: "USD",
    location: "Remote",
    remote_type: null,
    source,
  }
}

describe("job deduplication", () => {
  it("removes duplicate role+company pairs", () => {
    const jobs = [
      makeJob("Software Engineer", "Google"),
      makeJob("Software Engineer", "Google"),
      makeJob("Product Manager", "Google"),
    ]
    const deduped = dedupJobs(jobs)
    expect(deduped).toHaveLength(2)
  })

  it("case-insensitive dedup", () => {
    const jobs = [
      makeJob("Software Engineer", "Google"),
      makeJob("software engineer", "google"),
    ]
    const deduped = dedupJobs(jobs)
    expect(deduped).toHaveLength(1)
  })

  it("keeps different companies", () => {
    const jobs = [
      makeJob("Software Engineer", "Google"),
      makeJob("Software Engineer", "Meta"),
    ]
    const deduped = dedupJobs(jobs)
    expect(deduped).toHaveLength(2)
  })

  it("keeps different roles at same company", () => {
    const jobs = [
      makeJob("Software Engineer", "Google"),
      makeJob("Data Scientist", "Google"),
    ]
    const deduped = dedupJobs(jobs)
    expect(deduped).toHaveLength(2)
  })

  it("returns empty array for empty input", () => {
    expect(dedupJobs([])).toHaveLength(0)
  })
})
