import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { ZodSchema } from "zod"
import type { SupabaseClient } from "@supabase/supabase-js"

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX_ENTRIES = 10_000

function evictRateLimitMap() {
  if (rateLimitMap.size <= RATE_LIMIT_MAX_ENTRIES) return
  const now = Date.now()
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key)
  }
}

export function checkRateLimit(key: string, maxRequests = 5, windowMs = 60_000): NextResponse | null {
  evictRateLimitMap()
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return apiError(`Rate limit exceeded. Try again in ${retryAfter}s.`, 429)
  }

  entry.count++
  return null
}

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  error: null
}

export interface ApiErrorResponse {
  success: false
  data: null
  error: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

export function apiSuccess<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data, error: null })
}

export function apiError(error: string, status = 500): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ success: false, data: null, error }, { status })
}

export async function authenticate() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): { data: T; error: null } | { data: null; error: NextResponse } {
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join(", ")
    return { data: null, error: apiError(`Validation: ${msg}`, 400) }
  }
  return { data: parsed.data, error: null }
}

export async function logServerError(err: unknown, request: Request, source: string) {
  try {
    const { createClient } = await import("@supabase/supabase-js")
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return
    const supabase = createClient(url, key)
    await supabase.from("error_logs").insert({
      level: "error",
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      user_id: null,
      url: request.url,
      metadata: { source },
    })
  } catch { /* best-effort logging */ }
}

function extractSource(url: string): string {
  try {
    const pathname = new URL(url).pathname
    return pathname.replace(/^\/api\//, "").replace(/\//g, ":")
  } catch {
    return "unknown"
  }
}

export interface AuthContext {
  supabase: SupabaseClient
  user: { id: string; email?: string }
}

export function withAuth(
  handler: (request: Request, ctx: AuthContext) => Promise<NextResponse>
) {
  return async (request: Request) => {
    const { supabase, user } = await authenticate()
    if (!user) return apiError("Unauthorized", 401)
    try {
      return await handler(request, { supabase, user })
    } catch (err) {
      console.error("[withAuth ERROR]", extractSource(request.url), err)
      await logServerError(err, request, extractSource(request.url))
      return apiError("Internal server error", 500)
    }
  }
}

export function withAuthParams<TParams extends Record<string, string>>(
  handler: (request: Request, ctx: AuthContext & { params: TParams }) => Promise<NextResponse>
) {
  return async (request: Request, { params }: { params: Promise<TParams> }) => {
    const { supabase, user } = await authenticate()
    if (!user) return apiError("Unauthorized", 401)
    try {
      return await handler(request, { supabase, user, params: await params })
    } catch (err) {
      console.error("[withAuthParams ERROR]", extractSource(request.url), err)
      await logServerError(err, request, extractSource(request.url))
      return apiError("Internal server error", 500)
    }
  }
}
