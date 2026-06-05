import { NextRequest } from "next/server"
import { apiSuccess, apiError, authenticate } from "@/lib/api-handler"

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await authenticate()
    if (!user) return apiError("Unauthorized", 401)
    const body = await request.json()
    const { rating, message } = body

    if (rating < 1 || rating > 5 || !rating) {
      return apiError("Rating must be between 1 and 5", 400)
    }
    if (!message || message.trim() === "") {
      return apiError("Message is required", 400)
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
      return apiError(error.message, 500)
    }

    return apiSuccess(data)
  } catch (err) {
    return apiError("Internal server error", 500)
  }
}
