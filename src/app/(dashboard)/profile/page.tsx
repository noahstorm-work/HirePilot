import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProfileForm } from "@/components/profile/ProfileForm"
import { CvUploader } from "@/components/profile/CvUploader"
import { CvHistoryList } from "@/components/profile/CvHistoryList"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import type { CvVersion } from "@/types"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: cvVersions } = await supabase
    .from("cv_versions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const hasCv = !!profile?.cv_text

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Profile & CV</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your career profile and CV versions</p>
          </div>
          {hasCv && (
            <Link href="/dashboard">
              <Button>
                <Sparkles className="h-4 w-4 mr-1.5" />
                Run Analysis
              </Button>
            </Link>
          )}
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileForm
                initialData={{
                  full_name: profile?.full_name,
                  target_role: profile?.target_role,
                  target_seniority: profile?.target_seniority,
                  years_experience: profile?.years_experience,
                  linkedin_url: profile?.linkedin_url,
                  github_url: profile?.github_url,
                  portfolio_url: profile?.portfolio_url,
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">CV Text</CardTitle>
            </CardHeader>
            <CardContent>
              <CvUploader initialCvText={profile?.cv_text} />
            </CardContent>
          </Card>

          {cvVersions && cvVersions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">CV Version History</CardTitle>
              </CardHeader>
              <CardContent>
                <CvHistoryList
                  versions={cvVersions as CvVersion[]}
                  activeVersionId={profile?.cv_text ? cvVersions[0]?.id : null}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
