import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const schema = z.object({
  company: z.string().min(1).max(200),
  role_title: z.string().min(1).max(200),
  job_url: z.string().url().optional().or(z.literal("")),
  job_description: z.string().optional(),
  status: z.enum(["Saved", "Applied", "Interview", "Offer", "Rejected"]).default("Saved"),
  salary_range: z.string().optional(),
  location: z.string().optional(),
  remote_type: z.string().optional(),
  application_source: z.string().optional(),
  match_score: z.number().int().min(0).max(100).optional(),
  cv_version_id: z.string().uuid().optional(),
  notes: z.string().optional(),
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

    const { data, error } = await supabase
      .from("applications")
      .insert({ user_id: user.id, ...parsed.data })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data, error: null }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 })
  }
}
