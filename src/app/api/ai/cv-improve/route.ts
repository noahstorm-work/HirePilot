import { withAuth, apiSuccess, apiError, validateBody, checkRateLimit } from "@/lib/api-handler"
import { improveCV } from "@/lib/ai-service"
import { z } from "zod"

const schema = z.object({
  jobDescription: z.string().optional(),
  cvText: z.string().optional(),
  targetRole: z.string().optional(),
  cv_text: z.string().optional(),
  job_description: z.string().optional(),
})

export const POST = withAuth(async (request, { supabase, user }) => {
  const rl = checkRateLimit(`ai:${user.id}`, 5, 60_000)
  if (rl) return rl
  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const data = parsed.data
  const cvText = data.cvText || data.cv_text || ""
  const jobDescription = data.jobDescription || data.job_description || ""

  if (!cvText.trim()) {
    return apiError("CV text is required. Paste your CV text into the text area.", 400)
  }

  const result = await improveCV({ jobDescription, cvText, targetRole: data.targetRole })
  return apiSuccess(result)
})
