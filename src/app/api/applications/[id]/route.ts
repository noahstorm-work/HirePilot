import { withAuthParams, apiSuccess, apiError, validateBody } from "@/lib/api-handler"
import { z } from "zod"

const updateSchema = z.object({
  company: z.string().min(1).max(200).optional(),
  role_title: z.string().min(1).max(200).optional(),
  job_url: z.string().url().optional().or(z.literal("")),
  job_description: z.string().optional(),
  status: z.enum(["Saved", "Applied", "Interview", "Offer", "Rejected"]).optional(),
  salary_range: z.string().optional(),
  location: z.string().optional(),
  remote_type: z.string().optional(),
  match_score: z.number().int().min(0).max(100).optional(),
  cv_version_id: z.string().uuid().optional(),
  notes: z.string().optional(),
  application_source: z.string().optional(),
})

export const PATCH = withAuthParams<{ id: string }>(async (request, { supabase, user, params }) => {
  const body = await request.json()
  const parsed = validateBody(updateSchema, body)
  if (parsed.error) return parsed.error

  const { data, error } = await supabase
    .from("applications")
    .update(parsed.data)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
})

export const GET = withAuthParams<{ id: string }>(async (request, { supabase, user, params }) => {
  const { data: application, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error || !application) return apiError("Application not found", 404)

  const [analysisRes, rejectionRes] = await Promise.all([
    supabase.from("ai_results").select("*").eq("application_id", params.id).maybeSingle(),
    supabase.from("rejection_analyses").select("*").eq("application_id", params.id).maybeSingle(),
  ])

  return apiSuccess({
    application,
    analysis: analysisRes.data ?? null,
    rejectionAnalysis: rejectionRes.data ?? null,
  })
})

export const DELETE = withAuthParams<{ id: string }>(async (request, { supabase, user, params }) => {
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id)

  if (error) return apiError(error.message, 500)
  return apiSuccess(null)
})
