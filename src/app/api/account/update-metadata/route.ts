import { withAuth, apiSuccess, apiError, checkRateLimit } from "@/lib/api-handler"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import type { User } from "@supabase/supabase-js"

const schema = z.object({
  weekly_email_optin: z.boolean().optional(),
})

export const POST = withAuth(async (request, { user }) => {
  const fullUser = user as User
  const rl = checkRateLimit(`account-update:${user.id}`, 10, 60_000)
  if (rl) return rl

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return apiError("Invalid JSON body", 400)
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return apiError("Invalid request body", 400)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return apiError("Server configuration error", 500)
  }

  const supabaseAuth = createClient(supabaseUrl, serviceKey)

  const { error } = await supabaseAuth.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...fullUser.user_metadata,
      ...parsed.data,
    },
  })

  if (error) {
    console.error("Failed to update user metadata:", error)
    return apiError("Failed to update preferences", 500)
  }

  return apiSuccess({ updated: true })
})
