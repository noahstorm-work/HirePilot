import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { InterviewCoach } from "@/components/interview/InterviewCoach"
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
    <div className="space-y-6">
      <Link
        href={`/applications/${id}`}
        className="inline-flex items-center gap-1.5 text-xs text-[#63636e] hover:text-[#a0a0ab] transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to application
      </Link>

      <div>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] tracking-tight">Interview Preparation</h1>
        <p className="text-sm text-[#63636e] mt-1">
          {application.company} — {application.role_title}
        </p>
      </div>

      <div className="p-6 rounded-2xl border border-[#1e1e24] bg-[#0f0f12]">
        <InterviewCoach
          applicationId={id}
          jobDescription={application.job_description ?? ""}
          cvText={profile?.cv_text ?? ""}
        />
      </div>
    </div>
  )
}
