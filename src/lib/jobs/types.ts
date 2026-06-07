export type JobSource = "adzuna" | "jooble" | "jsearch"

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
  source: JobSource
}

export interface JobSearchResponse {
  results: JobSearchResult[]
  total: number
  source: JobSource
}
