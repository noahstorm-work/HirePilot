import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { InterviewCoach } from "@/components/interview/InterviewCoach"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function InterviewPrepPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: application } = await supabase
    .from("applications")
    .select("*")
    .eq("id", id)
    .eq("user_id", user?.id)
    .single()

  if (!application) notFound()

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("cv_text")
    .eq("id", user?.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link
          href={`/applications/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to application
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Interview Preparation</h1>
          <p className="text-sm text-gray-500 mt-1">
            {application.company} — {application.role_title}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Interview Coach</CardTitle>
          </CardHeader>
          <CardContent>
            <InterviewCoach
              applicationId={id}
              jobDescription={application.job_description ?? ""}
              cvText={profile?.cv_text ?? ""}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
