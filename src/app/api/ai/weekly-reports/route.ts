import { withAuth, apiSuccess, apiError, checkRateLimit } from "@/lib/api-handler"
import { generateWeeklyReport } from "@/lib/ai-service"

export const POST = withAuth(async (request, { supabase, user }) => {
  const rl = checkRateLimit(`ai:${user.id}`, 3, 60_000)
  if (rl) return rl
  const [analysisRes, profileRes, appsRes] = await Promise.all([
    supabase.from("career_analyses").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("user_profiles").select("target_role").eq("id", user.id).maybeSingle(),
    supabase.from("applications").select("status").eq("user_id", user.id),
  ])

  const analysis = analysisRes.data
  const profile = profileRes.data
  const apps = appsRes.data || []
  const targetRole = profile?.target_role || "Software Engineer"
  const interviewCount = apps.filter((a) => a.status === "Interview" || a.status === "Offer").length
  const interviewRate = apps.length > 0 ? Math.round((interviewCount / apps.length) * 100) : 0
  const topImprovements = analysis?.top_improvements
    ? (analysis.top_improvements as Array<{ action: string }>).slice(0, 3).map((i) => i.action).join("; ")
    : "No analysis data"

  const analysisSummary = analysis
    ? `CV Score: ${analysis.cv_score}, LinkedIn Score: ${analysis.linkedin_score || "N/A"}, Readiness: ${analysis.interview_readiness_score}/100`
    : "No career analysis available"

  const result = await generateWeeklyReport({
    targetRole,
    analysisSummary,
    applicationsCount: apps.length,
    interviewRate,
    topImprovements,
  })

  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + mondayOffset)
  const weekStartStr = weekStart.toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("weekly_reports")
    .upsert({
      user_id: user.id,
      week_start: weekStartStr,
      skills_in_demand: result.skills_in_demand,
      market_trends: result.market_trends,
      salary_ranges: result.salary_ranges,
      user_weaknesses: result.user_weaknesses,
      recommendations: result.recommendations,
    }, { onConflict: "user_id,week_start" })
    .select()
    .single()

  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
})
