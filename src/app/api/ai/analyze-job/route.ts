import { withAuth, apiSuccess, apiError, validateBody, checkRateLimit } from "@/lib/api-handler"
import { analyzeJobMatch } from "@/lib/ai-service"
import { COVER_LETTER_TEMPLATES } from "@/components/cover-letter/TemplatesPanel"
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
  role_title: z.string().optional(),
  template: z.string().optional(),
})

export const POST = withAuth(async (request, { supabase, user }) => {
  const rl = checkRateLimit(`ai:match:${user.id}`, 10, 60_000)
  if (rl) return rl
  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const d = parsed.data
  const applicationId = d.applicationId || d.application_id
  let jobDescription = d.jobDescription || d.job_description || ""
  let cvText = d.cvText || ""

  if (!cvText) {
    const { data: profile } = await supabase.from("user_profiles").select("cv_text").eq("id", user.id).maybeSingle()
    cvText = profile?.cv_text || ""
  }

  if (!jobDescription && (d.role_title || d.role || d.company)) {
    jobDescription = `Role: ${d.role_title || d.role || "Unknown"}${d.company ? ` at ${d.company}` : ""}`
  }
  if (!jobDescription) jobDescription = "General analysis"
  if (!cvText) return apiError("No CV text provided. Please add a CV in your profile.", 400)

  const templateStyle = COVER_LETTER_TEMPLATES.find((t) => t.id === d.template)?.promptModifier || ""
  const result = await analyzeJobMatch({ jobDescription, cvText, templateStyle })

  if (applicationId) {
    const { data: ownership } = await supabase
      .from("applications")
      .select("id")
      .eq("id", applicationId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (!ownership) return apiError("Application not found", 404)

    const analysis = {
      application_id: applicationId,
      match_score: result.match_score,
      strengths: result.strengths,
      missing_skills: result.missing_skills,
      cv_suggestions: result.cv_suggestions,
      cover_letter: result.cover_letter,
    }
    const { error: upsertError } = await supabase.from("ai_results").upsert(analysis, { onConflict: "application_id" })
    if (upsertError) {
      console.error("Failed to save job analysis:", upsertError)
    }
  }

  return apiSuccess(result)
})
