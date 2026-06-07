import { withAuth, apiSuccess, apiError, validateBody } from "@/lib/api-handler"
import { generateFollowup } from "@/lib/ai-service"
import { z } from "zod"

const schema = z.object({
  applicationId: z.string().uuid(),
  company: z.string().min(1),
  roleTitle: z.string().min(1),
  daysSince: z.number().int().min(0),
})

export const POST = withAuth(async (request, { supabase, user }) => {
  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const { applicationId, company, roleTitle, daysSince } = parsed.data
  const result = await generateFollowup({ company, roleTitle, daysSince })

  const emailBody = `Subject: ${result.subject}\n\n${result.body}`

  const { error } = await supabase
    .from("ai_results")
    .update({ follow_up_email: emailBody })
    .eq("application_id", applicationId)

  if (error) return apiError(error.message, 500)

  return apiSuccess({ subject: result.subject, body: result.body })
})
