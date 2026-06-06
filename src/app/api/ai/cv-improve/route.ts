import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { improveCV } from "@/lib/ai-service"
import { checkRateLimit, logServerError } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({
  jobDescription: z.string().optional(),
  cvText: z.string().optional(),
  targetRole: z.string().optional(),
  cv_text: z.string().optional(),
  job_description: z.string().optional(),
})

type CvImproveInput = z.infer<typeof schema>

function resolveCvText(data: CvImproveInput): string {
  return data.cvText || data.cv_text || ""
}

function resolveJobDescription(data: CvImproveInput): string {
  return data.jobDescription || data.job_description || ""
}

export async function POST(request: Request) {
  try {
    const supabaseClient = await createClient()
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const rl = checkRateLimit(`ai:${user.id}:cv-improve`, 5, 60_000)
    if (rl) return rl

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: `Validation: ${parsed.error.errors.map(e => e.path.join(".") + " " + e.message).join(", ")}` }, { status: 400 })
    }

    // Resolve snake_case or camelCase
    const data = parsed.data
    const cvText = resolveCvText(data)
    const jobDescription = resolveJobDescription(data)

    if (!cvText || !cvText.trim()) {
      return NextResponse.json({ success: false, data: null, error: "CV text is required. Paste your CV text into the text area." }, { status: 400 })
    }

    const result = await improveCV({
      jobDescription,
      cvText,
      targetRole: data.targetRole,
    })

    return NextResponse.json({ success: true, data: result, error: null })
  } catch (err) {
    await logServerError(err, request, "cv-improve")
    const errorMessage = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ success: false, data: null, error: errorMessage }, { status: 500 })
  }
}