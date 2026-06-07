import { createClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"
import { apiSuccess, apiError, checkRateLimit } from "@/lib/api-handler"
import { z } from "zod"

const schema = z.object({
  level: z.enum(["error", "warn", "info"]),
  message: z.string().max(2000),
  stack: z.string().max(5000).optional(),
  url: z.string().max(2000).optional(),
  user_agent: z.string().max(500).optional(),
  metadata: z.record(z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const rl = checkRateLimit("error-log", 30, 60_000)
    if (rl) return rl
    const supabase = await createClient()

    let userId = null
    const { data: { user } } = await supabase.auth.getUser()
    if (user) userId = user.id

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return apiError("Invalid error log payload", 400)
    }

    const { level, message, stack, url, user_agent, metadata } = parsed.data

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
  } catch {
    return apiError("Internal server error", 500)
  }
}
