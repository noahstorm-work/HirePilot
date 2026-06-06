import { NextRequest } from "next/server"
import { apiSuccess, apiError, authenticate } from "@/lib/api-handler"

const COMMON_ROLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Staff Software Engineer",
  "Principal Engineer",
  "Frontend Engineer",
  "Senior Frontend Engineer",
  "Backend Engineer",
  "Senior Backend Engineer",
  "Full Stack Developer",
  "Senior Full Stack Developer",
  "DevOps Engineer",
  "Senior DevOps Engineer",
  "Data Engineer",
  "Senior Data Engineer",
  "Data Scientist",
  "ML Engineer",
  "Product Manager",
  "Senior Product Manager",
  "Technical Program Manager",
  "Engineering Manager",
  "Senior Engineering Manager",
  "VP of Engineering",
  "CTO",
  "iOS Developer",
  "Android Developer",
  "Cloud Engineer",
  "Site Reliability Engineer",
  "Security Engineer",
  "QA Engineer",
  "UX Designer",
  "UI Designer",
  "Product Designer",
  "Business Analyst",
  "Scrum Master",
  "Solutions Architect",
  "Systems Administrator",
  "Database Administrator",
  "Technical Writer",
  "Account Executive",
  "Sales Representative",
  "Marketing Manager",
  "Content Strategist",
  "Growth Hacker",
  "Customer Success Manager",
]

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await authenticate()
    if (!user) return apiError("Unauthorized", 401)

    const q = request.nextUrl.searchParams.get("q")

    const { data: apps } = await supabase
      .from("applications")
      .select("role_title")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    const userRoles = [...new Set((apps || []).map((r: { role_title: string }) => r.role_title).filter(Boolean))]

    const targetRole = await supabase
      .from("user_profiles")
      .select("target_role")
      .eq("id", user.id)
      .single()

    const allRoles = [...new Set([targetRole.data?.target_role, ...userRoles, ...COMMON_ROLES].filter(Boolean))]

    if (!q || q.trim().length < 1) {
      const recent = userRoles.slice(0, 5)
      return apiSuccess(recent.length > 0 ? recent : allRoles.slice(0, 8))
    }

    const term = q.trim().toLowerCase()
    const matches = allRoles.filter((r) => r.toLowerCase().includes(term))
    return apiSuccess(matches.slice(0, 8))
  } catch (err) {
    return apiError("Internal server error", 500)
  }
}
