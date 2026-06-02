import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { error: authError } = await supabase.auth.getUser()
    // We don't require authentication for error logging, but we can get the user if available
    let userId = null
    if (!authError) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        userId = user.id
      }
    }

    const body = await request.json()
    const { level, message, stack, url, user_agent, metadata } = body

    const { error } = await supabase.from("error_logs").insert({
      level,
      message,
      stack,
      user_id: userId,
      url,
      user_agent,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        source: "client-error-log",
      },
    })

    if (error) {
      console.error("Failed to log error to Supabase:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Error in error-log API route:", err)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}