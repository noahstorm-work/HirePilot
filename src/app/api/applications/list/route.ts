import { withAuth, apiSuccess, apiError, checkRateLimit } from "@/lib/api-handler"

export const GET = withAuth(async (request, { supabase, user }) => {
  const rl = checkRateLimit(`app:list:${user.id}`, 30, 60_000)
  if (rl) return rl
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
})
