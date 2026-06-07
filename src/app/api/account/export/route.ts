import { withAuth, apiSuccess, apiError } from "@/lib/api-handler"

export const GET = withAuth(async (_request, { supabase, user }) => {
  const [profile, applications, aiResults, careerAnalyses, rejectionAnalyses, weeklyReports, savedJobs, cvVersions, skillProgress] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("applications").select("*").eq("user_id", user.id),
    supabase.from("ai_results").select("*").eq("user_id", user.id),
    supabase.from("career_analyses").select("*").eq("user_id", user.id),
    supabase.from("rejection_analyses").select("*").eq("user_id", user.id),
    supabase.from("weekly_reports").select("*").eq("user_id", user.id),
    supabase.from("saved_jobs").select("*").eq("user_id", user.id),
    supabase.from("cv_versions").select("*").eq("user_id", user.id),
    supabase.from("skill_progress").select("*").eq("user_id", user.id),
  ])

  const errors = [profile, applications, aiResults, careerAnalyses, rejectionAnalyses, weeklyReports, savedJobs, cvVersions, skillProgress]
    .filter((r) => r.error)
    .map((r) => r.error!.message)

  if (errors.length > 0) return apiError(`Failed to fetch some data: ${errors.join("; ")}`, 500)

  return apiSuccess({
    exported_at: new Date().toISOString(),
    user_id: user.id,
    email: user.email,
    profile: profile.data,
    applications: applications.data,
    ai_results: aiResults.data,
    career_analyses: careerAnalyses.data,
    rejection_analyses: rejectionAnalyses.data,
    weekly_reports: weeklyReports.data,
    saved_jobs: savedJobs.data,
    cv_versions: cvVersions.data,
    skill_progress: skillProgress.data,
  })
})
