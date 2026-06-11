import { withAuth, apiSuccess, apiError, validateBody, checkRateLimit } from "@/lib/api-handler"
import { analyzeRejection } from "@/lib/ai-service"
import { z } from "zod"

const schema = z.object({
  applicationId: z.string().uuid(),
  jobDescription: z.string().min(10),
  cvText: z.string().optional(),
  company: z.string().optional(),
  rejectionStage: z.string().optional(),
})

export const POST = withAuth(async (request, { supabase, user }) => {
  const rl = checkRateLimit(`ai:${user.id}`, 5, 60_000)
  if (rl) return rl
  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const d = parsed.data
  let cvText = d.cvText || ""

  if (!cvText || cvText.length < 10) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("cv_text")
      .eq("id", user.id)
      .maybeSingle()
    cvText = profile?.cv_text?.replace(/<[^>]*>/g, "").trim() || ""
  }

  if (!cvText || cvText.length < 10) {
    return apiError("CV text is required. Please add your CV in Profile first.", 400)
  }

  const result = await analyzeRejection({ jobDescription: d.jobDescription, cvText, rejectionStage: d.rejectionStage })

  const { data, error } = await supabase
    .from("rejection_analyses")
    .upsert({
      application_id: d.applicationId,
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
    console.error("Failed to save rejection analysis:", error)
    return apiError("Failed to save rejection analysis", 500)
  }
  return apiSuccess(data)
})
