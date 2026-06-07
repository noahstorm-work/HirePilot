import type { JobSearchResult, JobSource } from "./types"
import { searchAdzuna } from "./adzuna"
import { searchJooble } from "./jooble"
import { searchJSearch } from "./jsearch"

export type { JobSearchResult, JobSource } from "./types"

const ALL_SOURCES: JobSource[] = ["adzuna", "jooble", "jsearch"]

interface UnifiedSearchOptions {
  query: string
  location?: string
  page?: number
  sources?: JobSource[]
}

interface UnifiedSearchResult {
  results: JobSearchResult[]
  total: number
  sourceCounts: Record<JobSource, number>
}

export async function searchJobs(
  options: UnifiedSearchOptions
): Promise<UnifiedSearchResult> {
  const { query, location, page = 1, sources = ALL_SOURCES } = options

  const searchFns = sources.map((source) => {
    switch (source) {
      case "adzuna": return () => searchAdzuna(query, location, page)
      case "jooble": return () => searchJooble(query, location, page)
      case "jsearch": return () => searchJSearch(query, location, page)
    }
  })

  const searchResults = await Promise.allSettled(
    searchFns.map((fn) => fn())
  )

  const allResults: JobSearchResult[] = []
  const sourceCounts: Record<JobSource, number> = {
    adzuna: 0,
    jooble: 0,
    jsearch: 0,
  }
  let total = 0

  for (const result of searchResults) {
    if (result.status === "fulfilled") {
      allResults.push(...result.value.results)
      sourceCounts[result.value.source] = result.value.results.length
      total += result.value.total
    }
  }

  // Deduplicate by role_title + company (fuzzy)
  const seen = new Set<string>()
  const deduped = allResults.filter((job) => {
    const key = `${job.role_title.toLowerCase()}_${job.company.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return { results: deduped, total, sourceCounts }
}
