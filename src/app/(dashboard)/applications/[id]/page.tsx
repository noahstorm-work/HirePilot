import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/Navbar"
import { ApplicationWorkspace } from "@/components/applications/ApplicationWorkspace"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ExternalLink, Calendar, Trash2 } from "lucide-react"
import Link from "next/link"
import type { ApplicationStatus } from "@/types"

const statusColors: Record<string, "primary" | "success" | "warning" | "destructive"> = {
  Saved: "primary",
  Applied: "primary",
  Interview: "warning",
  Offer: "success",
  Rejected: "destructive",
}

export default async function ApplicationDetailPage({
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

  const { data: analysis } = await supabase
    .from("ai_results")
    .select("*")
    .eq("application_id", id)
    .single()

  const { data: rejection } = await supabase
    .from("rejection_analyses")
    .select("*")
    .eq("application_id", id)
    .single()

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
          href="/applications"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to applications
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-xl font-bold text-violet-600">
              {application.company.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{application.company}</h1>
              <p className="text-gray-500">{application.role_title}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={statusColors[application.status] ?? "primary"}>
                  {application.status}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {new Date(application.created_at).toLocaleDateString()}
                </span>
                {application.match_score !== null && (
                  <span className="text-xs text-violet-600 font-medium">
                    Match: {application.match_score}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {application.job_url && (
              <a
                href={application.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700"
              >
                <ExternalLink className="h-4 w-4" />
                View Job
              </a>
            )}
            {application.status === "Interview" && (
              <Link
                href={`/interview-prep/${id}`}
                className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 ml-3"
              >
                Prepare for Interview
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardContent className="pt-6">
              <ApplicationWorkspace
                applicationId={id}
                status={application.status as ApplicationStatus}
                jobDescription={application.job_description ?? ""}
                cvText={profile?.cv_text ?? ""}
                existingAnalysis={analysis ?? null}
                existingRejection={rejection ?? null}
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
