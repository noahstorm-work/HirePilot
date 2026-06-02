import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { rating, message } = body

    // Validate input
    if (rating < 1 || rating > 5 || !rating) {
      return NextResponse.json({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 })
    }
    if (!message || message.trim() === "") {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("feedback")
      .insert({
        user_id: user.id,
        rating,
        message,
        url: request.headers.get("referer") || "",
        user_agent: request.headers.get("user-agent") || "",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}