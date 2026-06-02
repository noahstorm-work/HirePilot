import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeJobMatch } from "@/lib/ai-service"
import { z } from "zod"

const schema = z.object({
  applicationId: z.string().uuid(),
  jobDescription: z.string().min(10),
  cvText: z.string().min(10),
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

    const { applicationId, jobDescription, cvText } = parsed.data

    const result = await analyzeJobMatch({ jobDescription, cvText })

    const analysis = {
      application_id: applicationId,
      match_score: result.match_score,
      strengths: result.strengths,
      missing_skills: result.missing_skills,
      cv_suggestions: result.cv_suggestions,
      cover_letter: result.cover_letter,
    }

    const { data, error } = await supabase
      .from("ai_results")
      .upsert(analysis, { onConflict: "application_id" })
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
