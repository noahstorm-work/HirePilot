import { NextRequest } from "next/server"
import { apiSuccess, apiError, authenticate } from "@/lib/api-handler"

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await authenticate()
    if (!user) return apiError("Unauthorized", 401)

    const q = request.nextUrl.searchParams.get("q")
    if (!q || q.trim().length < 1) {
      const { data } = await supabase
        .from("applications")
        .select("company")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      const { data: savedData } = await supabase
        .from("saved_jobs")
        .select("company")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)

      const all = [...(data || []), ...(savedData || [])]
      const unique = [...new Set(all.map((r: { company: string }) => r.company).filter(Boolean))]
      return apiSuccess(unique.slice(0, 8))
    }

    const term = q.trim().toLowerCase()

    const { data: apps } = await supabase
      .from("applications")
      .select("company")
      .eq("user_id", user.id)
      .ilike("company", `%${term}%`)
      .limit(10)

    const { data: saved } = await supabase
      .from("saved_jobs")
      .select("company")
      .eq("user_id", user.id)
      .ilike("company", `%${term}%`)
      .limit(10)

    const all = [...(apps || []), ...(saved || [])]
    const unique = [...new Set(all.map((r: { company: string }) => r.company).filter(Boolean))]
    return apiSuccess(unique.slice(0, 8))
  } catch (err) {
    return apiError("Internal server error", 500)
  }
}
