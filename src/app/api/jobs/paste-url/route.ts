import { withAuth, apiSuccess, apiError, validateBody } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({
  url: z.string().url(),
  company: z.string().optional(),
  roleTitle: z.string().optional(),
})

export const POST = withAuth(async (request, { supabase, user }) => {
  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const { url, company: fallbackCompany, roleTitle: fallbackRole } = parsed.data

  let html: string
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HirePilot/1.0; +https://hirepilot.app)",
        Accept: "text/html",
      },
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
