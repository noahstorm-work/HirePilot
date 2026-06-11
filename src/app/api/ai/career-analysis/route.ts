import { withAuth, apiSuccess, apiError, validateBody, checkRateLimit } from "@/lib/api-handler"
import { analyzeCareer } from "@/lib/ai-service"
import { fetchGitHubProfile, formatGitHubDataForAI } from "@/lib/github-api"
import { z } from "zod"

function extractGitHubUsername(url: string): string | null {
  try {
    const u = new URL(url)
    const parts = u.pathname.replace(/\/$/, "").split("/")
    return parts[parts.length - 1] || null
  } catch {
    return null
  }
}

const schema = z.object({
  cv_text: z.string().min(10),
  linkedin_url: z.string().optional(),
  linkedin_about: z.string().optional(),
  github_url: z.string().optional(),
  portfolio_url: z.string().optional(),
  target_role: z.string().optional(),
  target_seniority: z.string().optional(),
})

export const POST = withAuth(async (request, { supabase, user }) => {
  const rl = checkRateLimit(`ai:career:${user.id}`, 5, 60_000)
  if (rl) return rl
  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, years_experience, skills")
    .eq("id", user.id)
    .maybeSingle()

  let githubDataStr: string | undefined
  const githubUrl = parsed.data.github_url
  if (githubUrl) {
    const username = extractGitHubUsername(githubUrl)
    if (username) {
      const ghProfile = await fetchGitHubProfile(username)
      if (ghProfile) {
        githubDataStr = formatGitHubDataForAI(ghProfile)
      }
    }
  }

  const linkedinAbout = parsed.data.linkedin_about
  let linkedinDataStr: string | undefined
  if (parsed.data.linkedin_url) {
    linkedinDataStr = `LinkedIn URL: ${parsed.data.linkedin_url}`
    if (linkedinAbout?.trim()) {
      linkedinDataStr += `\n\nLinkedIn About:\n${linkedinAbout}`
    }
  } else if (linkedinAbout?.trim()) {
    linkedinDataStr = `LinkedIn About:\n${linkedinAbout}`
  }

  const result = await analyzeCareer({
    cvText: parsed.data.cv_text,
    linkedinData: linkedinDataStr,
    githubUrl: parsed.data.github_url,
    githubData: githubDataStr,
    portfolioUrl: parsed.data.portfolio_url,
    targetRole: parsed.data.target_role || "Software Engineer",
    targetSeniority: parsed.data.target_seniority,
    yearsExperience: profile?.years_experience ?? undefined,
    skills: profile?.skills ?? undefined,
    fullName: profile?.full_name ?? undefined,
  })

  const dbFields: Record<string, unknown> = {
    user_id: user.id,
    interview_readiness_score: result.interview_readiness_score,
    cv_score: result.cv_score,
    linkedin_score: result.linkedin_score,
    github_score: result.github_score,
    portfolio_score: result.portfolio_score,
    market_competitiveness_score: result.market_competitiveness_score,
    recruiter_appeal_score: result.recruiter_appeal_score,
    interview_probability: result.interview_probability,
    skills_gap_analysis: result.skills_gap_analysis,
    missing_keywords: result.missing_keywords,
    missing_technologies: result.missing_technologies,
    missing_experience_areas: result.missing_experience_areas,
    top_improvements: result.top_improvements,
    target_score: result.target_score,
    thirty_day_plan: result.thirty_day_plan,
  }

  if (githubDataStr) dbFields.github_data = githubDataStr

  const { data, error } = await supabase
    .from("career_analyses")
    .upsert(dbFields, { onConflict: "user_id" })
    .select()
    .single()

  if (error) {
    console.error("Failed to save career analysis:", error)
    return apiError("Failed to save career analysis", 500)
  }
  return apiSuccess(data)
})
