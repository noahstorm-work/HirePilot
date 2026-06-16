import { createClient } from "@/lib/supabase/server"
import { apiSuccess, apiError, withAuth, checkRateLimit } from "@/lib/api-handler"

export const GET = withAuth(async (request, { user }) => {
  const rl = checkRateLimit(`admin:errors:${user.id}`, 30, 60_000)
  if (rl) return rl

  const { searchParams } = new URL(request.url)
  const rawPage = parseInt(searchParams.get("page") || "1")
  const rawLimit = parseInt(searchParams.get("limit") || "50")
  const page = Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage)
  const limit = Number.isNaN(rawLimit) ? 50 : Math.min(100, Math.max(1, rawLimit))
  const level = searchParams.get("level")
  const search = searchParams.get("search")
  const offset = (page - 1) * limit

  const supabase = await createClient()
  let query = supabase.from("error_logs").select("*", { count: "exact" })

  if (level) query = query.eq("level", level)
  if (search) query = query.ilike("message", `%${search}%`)

  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

  const { data, error, count } = await query
  if (error) {
    console.error("Failed to fetch error logs:", error)
    return apiError("Failed to fetch error logs", 500)
  }

  return apiSuccess({ logs: data, total: count || 0, page, limit })
})
