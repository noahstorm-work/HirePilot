import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeCareer } from "@/lib/ai-service"
import { z } from "zod"

const schema = z.object({
  cvText: z.string().min(10),
  linkedinData: z.string().optional(),
  githubUrl: z.string().optional(),
  portfolioUrl: z.string().optional(),
  targetRole: z.string().min(1),
  targetSeniority: z.string().optional(),
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

    const result = await analyzeCareer(parsed.data)

    const { data, error } = await supabase
      .from("career_analyses")
      .upsert({ user_id: user.id, ...result }, { onConflict: "user_id" })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ success: false, data: null, error: message }, { status: 500 })
  }
}
