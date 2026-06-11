import { withAuth, apiSuccess, apiError, validateBody, checkRateLimit } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export const POST = withAuth(async (request, { supabase, user }) => {
  const rl = checkRateLimit(`pwd:${user.id}`, 3, 60_000)
  if (rl) return rl
  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  })

  if (error) {
    console.error("Failed to update password:", error)
    return apiError("Failed to update password", 400)
  }

  return apiSuccess({ updated: true })
})
