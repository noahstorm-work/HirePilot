import { withAuth, apiSuccess, apiError } from "@/lib/api-handler"

export const GET = withAuth(async (request, { supabase, user }) => {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")

  if (!q || q.trim().length < 1) {
    const [appsRes, savedRes] = await Promise.all([
      supabase.from("applications").select("company").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("saved_jobs").select("company").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    ])

    const all = [...(appsRes.data || []), ...(savedRes.data || [])]
    const unique = [...new Set(all.map((r: { company: string }) => r.company).filter(Boolean))]
    return apiSuccess(unique.slice(0, 8))
  }

  const term = q.trim().toLowerCase()

  const [appsRes, savedRes] = await Promise.all([
    supabase.from("applications").select("company").eq("user_id", user.id).ilike("company", `%${term}%`).limit(10),
    supabase.from("saved_jobs").select("company").eq("user_id", user.id).ilike("company", `%${term}%`).limit(10),
  ])

  const all = [...(appsRes.data || []), ...(savedRes.data || [])]
  const unique = [...new Set(all.map((r: { company: string }) => r.company).filter(Boolean))]
  return apiSuccess(unique.slice(0, 8))
})
