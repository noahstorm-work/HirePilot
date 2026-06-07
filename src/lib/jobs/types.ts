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

const CURRENCY_MAP: Record<string, { symbol: string; code: string }> = {
  "United States": { symbol: "$", code: "USD" },
  "US": { symbol: "$", code: "USD" },
  "USA": { symbol: "$", code: "USD" },
  "United Kingdom": { symbol: "£", code: "GBP" },
  "UK": { symbol: "£", code: "GBP" },
  "England": { symbol: "£", code: "GBP" },
  "Germany": { symbol: "€", code: "EUR" },
  "France": { symbol: "€", code: "EUR" },
  "Spain": { symbol: "€", code: "EUR" },
  "Italy": { symbol: "€", code: "EUR" },
  "Netherlands": { symbol: "€", code: "EUR" },
  "Ireland": { symbol: "€", code: "EUR" },
  "Canada": { symbol: "C$", code: "CAD" },
  "Australia": { symbol: "A$", code: "AUD" },
  "Japan": { symbol: "¥", code: "JPY" },
  "India": { symbol: "₹", code: "INR" },
  "Brazil": { symbol: "R$", code: "BRL" },
  "Remote": { symbol: "$", code: "USD" },
}

export function detectCurrency(location: string): { symbol: string; code: string } {
  for (const [key, currency] of Object.entries(CURRENCY_MAP)) {
    if (location.toLowerCase().includes(key.toLowerCase())) {
      return currency
    }
  }
  return { symbol: "$", code: "USD" }
}

export function formatSalary(min: number | null, max: number | null, currency: string, location: string): string | null {
  if (!min && !max) return null
  const { symbol } = detectCurrency(location)
  const fmt = (n: number) => {
    if (n >= 1000) return `${symbol}${Math.round(n / 1000)}k`
    return `${symbol}${n}`
  }
  if (min && max) return `${fmt(min)} - ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  return `Up to ${fmt(max!)}`
}
