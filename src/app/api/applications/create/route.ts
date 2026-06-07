import { withAuth, apiSuccess, apiError, validateBody } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({
  company: z.string().min(1).max(200),
  role_title: z.string().min(1).max(200),
  job_url: z.string().url().optional().or(z.literal("")),
  job_description: z.string().optional(),
  status: z.enum(["Saved", "Applied", "Interview", "Offer", "Rejected"]).default("Saved"),
  salary_range: z.string().optional(),
  location: z.string().optional(),
  remote_type: z.string().optional(),
  application_source: z.string().optional(),
  match_score: z.number().int().min(0).max(100).optional(),
  cv_version_id: z.string().uuid().optional(),
  notes: z.string().optional(),
})

export const POST = withAuth(async (request, { supabase, user }) => {
  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const { data, error } = await supabase
    .from("applications")
    .insert({ user_id: user.id, ...parsed.data })
    .select()
    .single()

  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
})
