import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeCareer } from "@/lib/ai-service"
import { z } from "zod"

const schema = z.object({
  cv_text: z.string().min(10),
  linkedin_url: z.string().optional(),
  github_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  target_role: z.string().optional(),
  target_seniority: z.string().optional(),
})

export async function POST(request: Request) {
  let supabaseClient: any
  try {
    supabaseClient = await createClient()
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.errors[0].message }, { status: 400 })
    }

    const result = await analyzeCareer({
      cvText: parsed.data.cv_text,
      linkedinData: parsed.data.linkedin_url,
      githubUrl: parsed.data.github_url,
      portfolioUrl: parsed.data.portfolio_url,
      targetRole: parsed.data.target_role || "Software Engineer",
      targetSeniority: parsed.data.target_seniority,
    })

    const dbFields = {
      user_id: user.id,
      interview_readiness_score: result.interview_readiness_score,
      cv_score: result.cv_score,
      linkedin_score: result.linkedin_score,
      github_score: result.github_score,
      portfolio_score: result.portfolio_score,
      market_competitiveness_score: result.market_competitiveness_score,
      recruiter_appeal_score: result.recruiter_appeal_score,
      interview_probability: result.interview_probability,
      skills_gap_analysis: result.skills_gap_analysis,
      missing_keywords: result.missing_keywords,
      missing_technologies: result.missing_technologies,
      missing_experience_areas: result.missing_experience_areas,
      top_improvements: result.top_improvements,
      target_score: result.target_score,
      thirty_day_plan: result.thirty_day_plan,
    }

    const { data, error } = await supabaseClient
      .from("career_analyses")
      .upsert(dbFields, { onConflict: "user_id" })
      .select()
      .single()

    if (error) {
      console.error("DB upsert error:", error.message, error.details, error.hint)
      return NextResponse.json({ success: false, data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data, error: null })
  } catch (err) {
    console.error("Career analysis error:", err)
    // Log the error to the database
    try {
      const errorSupabase = await createClient()
      await errorSupabase.from("error_logs").insert({
        level: "error",
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        user_id: null,
        url: request.url,
        metadata: {
          timestamp: new Date().toISOString(),
          source: "career-analysis-route",
        },
      })
    } catch (loggingError) {
      console.error("Failed to log error:", loggingError)
    }

    const errorMessage = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ success: false, data: null, error: errorMessage }, { status: 500 })
  }
}