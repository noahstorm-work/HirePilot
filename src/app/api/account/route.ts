import { createClient } from "@supabase/supabase-js"
import { withAuth, apiSuccess, apiError, checkRateLimit } from "@/lib/api-handler"

export const DELETE = withAuth(async (request, { user }) => {
  const rl = checkRateLimit(`account-delete:${user.id}`, 1, 60_000)
  if (rl) return rl

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return apiError("Server configuration error", 500)
  }

  const supabaseAuth = createClient(supabaseUrl, serviceKey)

  const { error: deleteError } = await supabaseAuth.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error("Failed to delete account:", deleteError)
    return apiError("Failed to delete account", 500)
  }

  return apiSuccess({ deleted: true })
})
