import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { improveCV } from "@/lib/ai-service"
import { z } from "zod"

const schema = z.object({
  jobDescription: z.string().min(10),
  cvText: z.string().min(10),
  targetRole: z.string().optional(),
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

    const result = await improveCV(parsed.data)

    return NextResponse.json({ success: true, data: result, error: null })
  } catch (err) {
    // Log the error to the database
    try {
      const errorSupabase = await createClient()
      await errorSupabase.from("error_logs").insert({
        level: "error",
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        user_id: null, // In catch block, we don't have reliable user info
        url: request.url,
        method: request.method,
        metadata: {
          timestamp: new Date().toISOString(),
          source: "cv-improve-route",
        },
      })
    } catch (loggingError) {
      // If logging fails, we don't want to break the app
      console.error("Failed to log error:", loggingError)
    }

    return NextResponse.json({ success: false, data: null, error: "Internal server error" }, { status: 500 })
  }
}