import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeRejection } from "@/lib/ai-service"
import { z } from "zod"

const schema = z.object({
  applicationId: z.string().uuid(),
  jobDescription: z.string().min(10),
  cvText: z.string().min(10),
  rejectionStage: z.string().optional(),
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

    const result = await analyzeRejection(parsed.data)

    const { data, error } = await supabase
      .from("rejection_analyses")
      .upsert({
        application_id: parsed.data.applicationId,
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
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ success: false, data: null, error: message }, { status: 500 })
  }
}
