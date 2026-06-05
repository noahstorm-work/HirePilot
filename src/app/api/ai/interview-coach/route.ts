import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateInterviewPrep } from "@/lib/ai-service"
import { z } from "zod"

const schema = z.object({
  jobDescription: z.string().optional(),
  cvText: z.string().optional(),
  applicationId: z.string().uuid().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  job_description: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.errors[0].message }, { status: 400 })
    }

    const data = parsed.data

    // Resolve job description and CV text from either format
    let jobDescription = data.jobDescription || data.job_description || ""
    let cvText = data.cvText || ""
    let applicationId = data.applicationId

    // If standalone mode (role provided, no applicationId), fetch user's CV
    if (!applicationId && data.role) {
      const { data: profile } = await supabase.from("user_profiles").select("cv_text").eq("id", user.id).maybeSingle()
      cvText = profile?.cv_text || ""
      jobDescription = jobDescription || `Role: ${data.role}${data.company ? ` at ${data.company}` : ""}`
    }

    // If applicationId provided, fetch from application
    if (applicationId && !cvText) {
      const { data: app } = await supabase.from("applications").select("notes, job_description").eq("id", applicationId).maybeSingle()
      const { data: profile } = await supabase.from("user_profiles").select("cv_text").eq("id", user.id).maybeSingle()
      cvText = profile?.cv_text || ""
      jobDescription = jobDescription || app?.job_description || app?.notes || ""
    }

    // Ensure we have minimum required data
    if (!jobDescription) {
      jobDescription = data.role ? `Position: ${data.role}` : ""
    }
    if (!cvText) {
      cvText = "No CV provided"
    }

    const result = await generateInterviewPrep({ jobDescription, cvText })

    // Only save to DB if we have an applicationId
    if (applicationId) {
      const { error } = await supabase
        .from("ai_results")
        .upsert({
          application_id: applicationId,
          interview_questions: result,
        }, { onConflict: "application_id" })

      if (error) {
        console.error("DB save error:", error.message)
      }
    }

    return NextResponse.json({ success: true, data: result, error: null })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ success: false, data: null, error: message }, { status: 500 })
  }
}
