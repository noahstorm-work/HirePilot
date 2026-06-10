import { apiSuccess, apiError } from "@/lib/api-handler"

export async function GET() {
  const email = process.env.DEMO_EMAIL || process.env.NEXT_PUBLIC_DEMO_EMAIL
  const password = process.env.DEMO_PASSWORD || process.env.NEXT_PUBLIC_DEMO_PASSWORD

  if (!email || !password) {
    return apiError("Demo account not configured", 500)
  }

  return apiSuccess({ email, password })
}
