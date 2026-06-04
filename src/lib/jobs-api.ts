export interface JobSearchResult {
  external_id: string
  company: string
  role_title: string
  description: string
  url: string
  salary_min: number | null
  salary_max: number | null
  salary_currency: string
  location: string
  remote_type: string | null
  source: "adzuna"
}

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
): Promise<{ results: JobSearchResult[]; total: number }> {
  const appId = process.env.ADZUNA_APP_ID
  const apiKey = process.env.ADZUNA_API_KEY

  if (!appId || !apiKey) {
    throw new Error("Adzuna API credentials not configured")
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
    throw new Error(`Adzuna API error: ${res.status} ${res.statusText}`)
  }

  const data: AdzunaResponse = await res.json()

  const results: JobSearchResult[] = data.results.map((job) => ({
    external_id: `adzuna_${job.id}`,
    company: job.company.display_name,
    role_title: job.title,
    description: job.description,
    url: job.redirect_url,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_currency: "GBP",
    location: job.location.display_name,
    remote_type: null,
    source: "adzuna" as const,
  }))

  return { results, total: data.count }
}
