import type { JobSearchResult, JobSearchResponse } from "./types"
import { detectCurrency } from "./types"

interface AdzunaResponse {
  results: Array<{
    id: string
    title: string
    company: { display_name: string }
    description: string
    redirect_url: string
    salary_min: number | null
    salary_max: number | null
    salary_is_predicted: string
    location: { display_name: string }
    contract_type: string | null
    created: string
  }>
  count: number
}

export async function searchAdzuna(
  query: string,
  location?: string,
  page = 1,
): Promise<JobSearchResponse> {
  const appId = process.env.ADZUNA_APP_ID
  const apiKey = process.env.ADZUNA_API_KEY

  if (!appId || !apiKey) {
    return { results: [], total: 0, source: "adzuna" }
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: apiKey,
    results_per_page: "20",
    what: query,
  })

  if (location) params.set("where", location)
  if (page > 1) params.set("page", String(page))

  const url = `https://api.adzuna.com/v1/api/jobs/gb/search/${page}?${params}`

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  })

  if (!res.ok) {
    console.error(`Adzuna API error: ${res.status}`)
    return { results: [], total: 0, source: "adzuna" }
  }

  const data: AdzunaResponse = await res.json()

  const results: JobSearchResult[] = data.results.map((job) => {
    const location = job.location.display_name
    const { code } = detectCurrency(location)
    return {
      external_id: `adzuna_${job.id}`,
      company: job.company.display_name,
      role_title: job.title,
      description: job.description,
      url: job.redirect_url,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      salary_currency: code,
      location,
      remote_type: null,
      source: "adzuna" as const,
    }
  })

  return { results, total: data.count, source: "adzuna" }
}
