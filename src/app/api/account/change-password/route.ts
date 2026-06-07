import { withAuth, apiSuccess, apiError, validateBody } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
})

export const POST = withAuth(async (request, { supabase }) => {
  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  })

  if (error) return apiError(error.message, 400)

  return apiSuccess({ updated: true })
})
