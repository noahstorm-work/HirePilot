import type { JobSearchResult, JobSearchResponse } from "./types"
import { detectCurrency, extractApplyEmail } from "./types"

interface JoobleResponse {
  results: Array<{
    title: string
    company: string
    location: string
    salary: string
    description: string
    url: string
    id: string
  }>
  totalCount: number
}

function parseSalary(salaryStr: string | undefined, type: "min" | "max"): number | null {
  if (!salaryStr) return null
  const matches = salaryStr.match(/\d[\d,]*/g)
  if (!matches || matches.length === 0) return null
  const nums = matches.map((m) => parseInt(m.replace(/,/g, ""), 10))
  if (type === "min") return nums[0] || null
  return nums[nums.length - 1] || null
}

export async function searchJooble(
  query: string,
  location?: string,
  page = 1,
): Promise<JobSearchResponse> {
  const apiKey = process.env.JOOBLE_API_KEY

  if (!apiKey) {
    return { results: [], total: 0, source: "jooble" }
  }

  const body: Record<string, unknown> = {
    keywords: query,
    page,
  }
  if (location) body.location = location

  const res = await fetch(`https://api.jooble.org/api/${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    console.error(`Jooble API error: ${res.status}`)
    return { results: [], total: 0, source: "jooble" }
  }

  const data: JoobleResponse = await res.json()

  const results: JobSearchResult[] = (data.results || []).map((job) => {
    const location = job.location || "Remote"
    const { code } = detectCurrency(location)
    return {
      external_id: `jooble_${job.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`}`,
      company: job.company || "Unknown",
      role_title: job.title || "Unknown Role",
      description: job.description || "",
      url: job.url || "#",
      salary_min: parseSalary(job.salary, "min"),
      salary_max: parseSalary(job.salary, "max"),
      salary_currency: code,
      location,
      remote_type: null,
      source: "jooble" as const,
      apply_email: extractApplyEmail(job.description || "") || undefined,
    }
  })

  return { results, total: data.totalCount || 0, source: "jooble" }
}
