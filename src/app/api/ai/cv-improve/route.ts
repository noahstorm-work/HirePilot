import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { improveCV } from "@/lib/ai-service"
import { z } from "zod"

const schema = z.object({
  jobDescription: z.string().optional(),
  cvText: z.string().min(1),
  targetRole: z.string().optional(),
  cv_text: z.string().optional(),
  job_description: z.string().optional(),
})

export async function POST(request: Request) {
  let supabaseClient: any
  try {
    supabaseClient = await createClient()
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.errors[0].message }, { status: 400 })
    }

    // Resolve snake_case or camelCase
    const data = parsed.data
    const result = await improveCV({
      jobDescription: data.jobDescription || data.job_description || "",
      cvText: data.cvText || data.cv_text || "",
      targetRole: data.targetRole,
    })

    return NextResponse.json({ success: true, data: result, error: null })
  } catch (err) {
    console.error("CV improve error:", err)
    try {
      const errorSupabase = await createClient()
      await errorSupabase.from("error_logs").insert({
        level: "error",
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        user_id: null,
        url: request.url,
        metadata: { source: "cv-improve-route" },
      })
    } catch (loggingError) {
      console.error("Failed to log error:", loggingError)
    }
    const errorMessage = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ success: false, data: null, error: errorMessage }, { status: 500 })
  }
}