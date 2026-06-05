import { createClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"
import { apiSuccess, apiError } from "@/lib/api-handler"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    let userId = null
    const { data: { user } } = await supabase.auth.getUser()
    if (user) userId = user.id

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
      return apiError(error.message, 500)
    }

    return apiSuccess({ id: null })
  } catch (err) {
    return apiError("Internal server error", 500)
  }
}
