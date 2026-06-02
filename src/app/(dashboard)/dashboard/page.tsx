import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScoreOverview } from "@/components/dashboard/ScoreOverview"
import { ReadinessJourney } from "@/components/dashboard/ReadinessJourney"
import { TopImprovements } from "@/components/dashboard/TopImprovements"
import { ThirtyDayPlan } from "@/components/dashboard/ThirtyDayPlan"
import { SkillsGapList } from "@/components/dashboard/SkillsGapList"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Search } from "lucide-react"
import Link from "next/link"
import type { CareerAnalysis } from "@/types"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: analysis } = await supabase
    .from("career_analyses")
    .select("*")
    .eq("user_id", user.id)
    .single()

  const { data: recentApplications } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const needsOnboarding = !profile?.cv_text

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        {needsOnboarding ? (
          <Card className="mb-8">
            <CardContent className="py-12 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-violet-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to HirePilot</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                Upload your CV and set your target role to get your Interview Readiness Score and start optimizing.
              </p>
              <Link href="/profile">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : analysis ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Career Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Target: <span className="font-medium text-gray-700">{profile.target_role}</span>
                </p>
              </div>
              <Link href="/discover">
                <Button>
                  <Search className="h-4 w-4 mr-1.5" />
                  Find Jobs
                </Button>
              </Link>
            </div>

            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Interview Readiness Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReadinessJourney
                    currentScore={analysis.interview_readiness_score}
                    targetScore={analysis.target_score}
                  />
                </CardContent>
              </Card>

              <ScoreOverview analysis={analysis as unknown as CareerAnalysis} />

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Improvements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TopImprovements improvements={(analysis.top_improvements as any[]) ?? []} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Skills & Gaps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SkillsGapList
                      gaps={(analysis.skills_gap_analysis as any[]) ?? []}
                      keywords={analysis.missing_keywords ?? []}
                      technologies={analysis.missing_technologies ?? []}
                      experienceAreas={analysis.missing_experience_areas ?? []}
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">30-Day Improvement Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <ThirtyDayPlan plan={(analysis.thirty_day_plan as any[]) ?? []} />
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-violet-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready for Your Career Analysis</h2>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                We have your CV. Click below to get your full Interview Readiness analysis.
              </p>
              <Link href="/profile">
                <Button size="lg">
                  Run Analysis
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {recentApplications && recentApplications.length > 0 && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Applications</CardTitle>
              <Link href="/applications" className="text-xs text-violet-600 hover:text-violet-700">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentApplications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/applications/${app.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-xs font-semibold text-violet-600">
                        {app.company.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{app.company}</p>
                        <p className="text-xs text-gray-500">{app.role_title}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{app.status}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
