import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeJobMatch } from "@/lib/ai-service"
import { checkRateLimit, logServerError } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({
  applicationId: z.string().uuid().optional(),
  application_id: z.string().uuid().optional(),
  jobDescription: z.string().min(1).optional(),
  job_description: z.string().optional(),
  job_url: z.string().optional(),
  cvText: z.string().min(1).optional(),
  company: z.string().optional(),
  role: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabaseClient = await createClient()
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const rl = checkRateLimit(`ai:${user.id}:analyze-job`, 10, 60_000)
    if (rl) return rl

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.errors[0].message }, { status: 400 })
    }

    const d = parsed.data
    const applicationId = d.applicationId || d.application_id
    let jobDescription = d.jobDescription || d.job_description || ""
    let cvText = d.cvText || ""

    // If standalone mode (no cvText), fetch from profile
    if (!cvText) {
      const { data: profile } = await supabaseClient.from("user_profiles").select("cv_text").eq("id", user.id).maybeSingle()
      cvText = profile?.cv_text || ""
    }

    // If no jobDescription, build from role/company
    if (!jobDescription && (d.role || d.company)) {
      jobDescription = `Role: ${d.role || "Unknown"}${d.company ? ` at ${d.company}` : ""}`
    }

    if (!jobDescription) {
      jobDescription = "General analysis"
    }
    if (!cvText) {
      return NextResponse.json({ success: false, data: null, error: "No CV text provided. Please add a CV in your profile." }, { status: 400 })
    }

    const result = await analyzeJobMatch({ jobDescription, cvText })

    // Save to DB if we have an applicationId
    if (applicationId) {
      const analysis = {
        application_id: applicationId,
        match_score: result.match_score,
        strengths: result.strengths,
        missing_skills: result.missing_skills,
        cv_suggestions: result.cv_suggestions,
        cover_letter: result.cover_letter,
      }

      const { error } = await supabaseClient
        .from("ai_results")
        .upsert(analysis, { onConflict: "application_id" })
        .select()
        .single()

      if (error) {
        console.error("DB save error:", error.message)
      }
    }

    return NextResponse.json({ success: true, data: result, error: null })
  } catch (err) {
    await logServerError(err, request, "analyze-job")
    const errorMessage = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ success: false, data: null, error: errorMessage }, { status: 500 })
  }
}