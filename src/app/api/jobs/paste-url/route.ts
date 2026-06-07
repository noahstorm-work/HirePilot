import { withAuth, apiSuccess, apiError, validateBody } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({
  url: z.string().url(),
  company: z.string().optional(),
  roleTitle: z.string().optional(),
})

function isPrivateIP(hostname: string): boolean {
  const ip = hostname.replace(/^::ffff:/, "")
  if (ip === "localhost" || ip === "127.0.0.1" || ip === "::1") return true
  if (/^10\./.test(ip)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true
  if (/^192\.168\./.test(ip)) return true
  if (/^0\./.test(ip)) return true
  return false
}

export const POST = withAuth(async (request, { supabase, user }) => {
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

  if (isPrivateIP(parsedUrl.hostname)) {
    return apiError("Internal/private URLs are not allowed", 400)
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
    html = await res.text()
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
