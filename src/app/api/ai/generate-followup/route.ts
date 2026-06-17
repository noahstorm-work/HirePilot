import { withAuth, apiSuccess, apiError, validateBody, checkRateLimit } from "@/lib/api-handler"
import { generateFollowup } from "@/lib/ai-service"
import { z } from "zod"

const schema = z.object({
  applicationId: z.string().uuid().optional(),
  application_id: z.string().uuid().optional(),
  company: z.string().min(1),
  roleTitle: z.string().min(1).optional(),
  role_title: z.string().min(1).optional(),
  daysSince: z.number().int().min(0).optional(),
  days_since: z.number().int().min(0).optional(),
}).refine(
  (data) => data.applicationId || data.application_id,
  { message: "applicationId or application_id is required" }
).refine(
  (data) => data.roleTitle || data.role_title,
  { message: "roleTitle or role_title is required" }
).refine(
  (data) => data.daysSince !== undefined || data.days_since !== undefined,
  { message: "daysSince or days_since is required" }
)

export const POST = withAuth(async (request, { supabase, user }) => {
  const rl = checkRateLimit(`ai:followup:${user.id}`, 10, 60_000)
  if (rl) return rl
  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const applicationId = parsed.data.applicationId || parsed.data.application_id!
  const roleTitle = parsed.data.roleTitle || parsed.data.role_title!
  const daysSince = parsed.data.daysSince ?? parsed.data.days_since!

  const { data: ownership } = await supabase
    .from("applications")
    .select("id")
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!ownership) return apiError("Application not found", 404)

  const result = await generateFollowup({ company: parsed.data.company, roleTitle, daysSince })

  const emailBody = `Subject: ${result.subject}\n\n${result.body}`

  const { error } = await supabase
    .from("ai_results")
    .upsert({ application_id: applicationId, follow_up_email: emailBody }, { onConflict: "application_id" })

  if (error) {
    console.error("Failed to save follow-up email:", error)
    return apiError("Failed to save follow-up email", 500)
  }

  return apiSuccess({ subject: result.subject, body: result.body })
})
