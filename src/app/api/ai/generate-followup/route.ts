import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateFollowup } from "@/lib/ai-service"
import { checkRateLimit, logServerError } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({
  applicationId: z.string().uuid(),
  company: z.string().min(1),
  roleTitle: z.string().min(1),
  daysSince: z.number().int().min(0),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, data: null, error: "Unauthorized" }, { status: 401 })
    }

    const rl = checkRateLimit(`ai:${user.id}:generate-followup`, 5, 60_000)
    if (rl) return rl

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, data: null, error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { applicationId, company, roleTitle, daysSince } = parsed.data

    const result = await generateFollowup({ company, roleTitle, daysSince })

    const emailBody = `Subject: ${result.subject}\n\n${result.body}`

    const { error } = await supabase
      .from("ai_results")
      .update({ follow_up_email: emailBody })
      .eq("application_id", applicationId)

    if (error) {
      return NextResponse.json({ success: false, data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { subject: result.subject, body: result.body },
      error: null,
    })
  } catch (err) {
    await logServerError(err, request, "generate-followup")
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ success: false, data: null, error: message }, { status: 500 })
  }
}
