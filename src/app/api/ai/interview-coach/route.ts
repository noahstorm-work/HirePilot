import { withAuth, apiSuccess, apiError, validateBody } from "@/lib/api-handler"
import { generateInterviewPrep } from "@/lib/ai-service"
import { z } from "zod"

const schema = z.object({
  jobDescription: z.string().optional(),
  cvText: z.string().optional(),
  applicationId: z.string().uuid().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  job_description: z.string().optional(),
})

export const POST = withAuth(async (request, { supabase, user }) => {
  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const data = parsed.data
  let jobDescription = data.jobDescription || data.job_description || ""
  let cvText = data.cvText || ""
  const applicationId = data.applicationId

  if (!applicationId && data.role) {
    const { data: profile } = await supabase.from("user_profiles").select("cv_text").eq("id", user.id).maybeSingle()
    cvText = profile?.cv_text || ""
    jobDescription = jobDescription || `Role: ${data.role}${data.company ? ` at ${data.company}` : ""}`
  }

  if (applicationId && !cvText) {
    const [appRes, profileRes] = await Promise.all([
      supabase.from("applications").select("notes, job_description").eq("id", applicationId).maybeSingle(),
      supabase.from("user_profiles").select("cv_text").eq("id", user.id).maybeSingle(),
    ])
    cvText = profileRes.data?.cv_text || ""
    jobDescription = jobDescription || appRes.data?.job_description || appRes.data?.notes || ""
  }

  if (!jobDescription) jobDescription = data.role ? `Position: ${data.role}` : ""
  if (!cvText) cvText = "No CV provided"

  const result = await generateInterviewPrep({ jobDescription, cvText })

  if (applicationId) {
    await supabase.from("ai_results").upsert({
      application_id: applicationId,
      interview_questions: result,
    }, { onConflict: "application_id" })
  }

  return apiSuccess(result)
})
