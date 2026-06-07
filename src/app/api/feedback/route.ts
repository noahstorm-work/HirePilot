import { withAuth, apiSuccess, apiError, validateBody, checkRateLimit } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  message: z.string().min(1).max(2000),
})

export const POST = withAuth(async (request, { supabase, user }) => {
  const rl = checkRateLimit(`feedback:${user.id}`, 5, 60_000)
  if (rl) return rl

  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const { rating, message } = parsed.data

  const { data, error } = await supabase
    .from("feedback")
    .insert({
      user_id: user.id,
      rating,
      message,
      url: request.headers.get("referer") || "",
      user_agent: request.headers.get("user-agent") || "",
    })
    .select()
    .single()

  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
})
