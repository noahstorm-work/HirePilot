import { withAuth, apiSuccess, apiError, validateBody, checkRateLimit } from "@/lib/api-handler"
import { z } from "zod"
import { resolve4 } from "dns/promises"

const schema = z.object({
  url: z.string().url(),
  company: z.string().optional(),
  roleTitle: z.string().optional(),
})

function isPrivateIP(ip: string): boolean {
  const cleaned = ip.replace(/^::ffff:/, "")
  if (/^127\./.test(cleaned) || cleaned === "::1") return true
  if (/^10\./.test(cleaned)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(cleaned)) return true
  if (/^192\.168\./.test(cleaned)) return true
  if (/^0\./.test(cleaned) || cleaned === "0.0.0.0") return true
  if (/^169\.254\./.test(cleaned)) return true
  return false
}

export const POST = withAuth(async (request, { user }) => {
  const rl = checkRateLimit(`paste-url:${user.id}`, 10, 60_000)
  if (rl) return rl

  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const { url, company: fallbackCompany, roleTitle: fallbackRole } = parsed.data

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return apiError("Invalid URL", 400)
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return apiError("Only HTTP/HTTPS URLs are supported", 400)
  }

  // Resolve hostname to IP before fetching to prevent SSRF via DNS rebinding
  try {
    const ips = await resolve4(parsedUrl.hostname)
    if (ips.some(isPrivateIP)) {
      return apiError("Internal/private URLs are not allowed", 400)
    }
  } catch {
    return apiError("Could not resolve hostname", 400)
  }

  let html: string
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HirePilot/1.0; +https://hirepilot.app)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const text = await res.text()
    if (text.length > 1_048_576) {
      return apiError("Response too large (>1MB)", 400)
    }
    html = text
  } catch {
    return apiError("Could not fetch the job URL. The site may block automated access.", 502)
  }

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const metaDescMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)

  const extractedTitle = titleMatch?.[1]?.trim() ?? null
  const extractedDescription = metaDescMatch?.[1] ?? null

  return apiSuccess({
    url,
    company: fallbackCompany ?? null,
    role_title: fallbackRole ?? extractedTitle ?? "Unknown Role",
    description: extractedDescription ?? null,
  })
})
