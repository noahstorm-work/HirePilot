import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { logServerError } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({
  url: z.string().url(),
  company: z.string().optional(),
  roleTitle: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { url, company: fallbackCompany, roleTitle: fallbackRole } = parsed.data

    // Fetch the page content
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
      return NextResponse.json({
        success: false,
        data: null,
        error: "Could not fetch the job URL. The site may block automated access.",
      }, { status: 502 })
    }

    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const metaDescMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)

    const extractedTitle = titleMatch?.[1]?.trim() ?? null
    const extractedDescription = metaDescMatch?.[1] ?? null

    const result = {
      url,
      company: fallbackCompany ?? null,
      role_title: fallbackRole ?? extractedTitle ?? "Unknown Role",
      description: extractedDescription ?? null,
    }

    return NextResponse.json({ success: true, data: result, error: null })
  } catch (err) {
    await logServerError(err, request, "paste-url")
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ success: false, data: null, error: message }, { status: 500 })
  }
}
