import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { searchAdzuna } from "@/lib/jobs-api"
import { z } from "zod"

const schema = z.object({
  query: z.string().min(1),
  location: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
})

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const parsed = schema.safeParse({
      query: searchParams.get("query"),
      location: searchParams.get("location"),
      page: searchParams.get("page") ?? 1,
    })

    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { results, total } = await searchAdzuna(parsed.data.query, parsed.data.location, parsed.data.page)

    return NextResponse.json({
      success: true,
      data: { results, total, page: parsed.data.page, per_page: 20 },
      error: null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ success: false, data: null, error: message }, { status: 500 })
  }
}
