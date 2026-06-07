import type { JobSearchResult, JobSearchResponse } from "./types"

interface JSearchResponse {
  data: Array<{
    job_id: string
    employer_name: string
    job_title: string
    job_description: string
    job_apply_link: string
    job_min_salary: number | null
    job_max_salary: number | null
    job_country: string
    job_city: string
    job_state: string
    job_is_remote: boolean
  }>
  count: number
}

export async function searchJSearch(
  query: string,
  location?: string,
  page = 1,
): Promise<JobSearchResponse> {
  const apiKey = process.env.JSEARCH_API_KEY

  if (!apiKey) {
    return { results: [], total: 0, source: "jsearch" }
  }

  const searchQuery = location ? `${query} in ${location}` : query
  const params = new URLSearchParams({
    query: searchQuery,
    page: String(page),
    num_pages: "1",
  })

  const res = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
  })

  if (!res.ok) {
    console.error(`JSearch API error: ${res.status}`)
    return { results: [], total: 0, source: "jsearch" }
  }

  const data: JSearchResponse = await res.json()

  const results: JobSearchResult[] = (data.data || []).map((job) => ({
    external_id: `jsearch_${job.job_id}`,
    company: job.employer_name || "Unknown",
    role_title: job.job_title || "Unknown Role",
    description: job.job_description || "",
    url: job.job_apply_link || "#",
    salary_min: job.job_min_salary,
    salary_max: job.job_max_salary,
    salary_currency: "USD",
    location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", "),
    remote_type: job.job_is_remote ? "remote" : null,
    source: "jsearch" as const,
  }))

  return { results, total: data.count || 0, source: "jsearch" }
}
