import { withAuth, apiSuccess, apiError, checkRateLimit } from "@/lib/api-handler"

export const GET = withAuth(async (_request, { user }) => {
  const rl = checkRateLimit(`demo-creds:${user.id}`, 10, 60_000)
  if (rl) return rl
  const email = process.env.DEMO_EMAIL || process.env.NEXT_PUBLIC_DEMO_EMAIL
  const password = process.env.DEMO_PASSWORD || process.env.NEXT_PUBLIC_DEMO_PASSWORD

  if (!email || !password) {
    return apiError("Demo account not configured", 500)
  }

  return apiSuccess({ email, password })
})
