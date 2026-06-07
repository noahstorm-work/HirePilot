import { withAuthParams, apiSuccess, apiError, validateBody } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({
  status: z.enum(["Saved", "Applied", "Interview", "Offer", "Rejected"]),
})

export const PATCH = withAuthParams<{ id: string }>(async (request, { supabase, user, params }) => {
  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const { data, error } = await supabase
    .from("applications")
    .update({ status: parsed.data.status })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
})
