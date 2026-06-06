import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeRejection } from "@/lib/ai-service"
import { checkRateLimit, logServerError } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({
  applicationId: z.string().uuid(),
  jobDescription: z.string().min(10),
  cvText: z.string().optional(),
  application_id: z.string().uuid().optional(),
  job_description: z.string().optional(),
  cv_text: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  rejectionStage: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const rl = checkRateLimit(`ai:${user.id}:rejection-analysis`, 5, 60_000)
    if (rl) return rl

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.errors[0].message }, { status: 400 })
    }

    const d = parsed.data
    const applicationId = d.applicationId || d.application_id!
    const jobDescription = d.jobDescription || d.job_description!
    let cvText = d.cvText || d.cv_text || ""

    if (!cvText || cvText.length < 10) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("cv_text")
        .eq("id", user.id)
        .single()
      cvText = profile?.cv_text?.replace(/<[^>]*>/g, "").trim() || ""
    }

    if (!cvText || cvText.length < 10) {
      return NextResponse.json({ success: false, data: null, error: "CV text is required. Please add your CV in Profile first." }, { status: 400 })
    }

    const result = await analyzeRejection({ jobDescription, cvText, rejectionStage: d.rejectionStage })

    const { data, error } = await supabase
      .from("rejection_analyses")
      .upsert({
        application_id: applicationId,
        user_id: user.id,
        likely_reasons: result.likely_reasons,
        skills_gaps: result.skills_gaps,
        cv_weaknesses: result.cv_weaknesses,
        market_competition_note: result.market_competition_note,
        improvement_plan: result.improvement_plan,
      }, { onConflict: "application_id" })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data, error: null })
  } catch (err) {
    await logServerError(err, request, "rejection-analysis")
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ success: false, data: null, error: message }, { status: 500 })
  }
}
