import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  const nonce = crypto.randomUUID().replace(/-/g, "")
  response.cookies.set("csp-nonce", nonce, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  })

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://*.supabase.co https://api.groq.com https://api.adzuna.com https://api.jooble.org https://jobsearch.api.jobicy.com https://nominatim.openstreetmap.org https://r.jina.ai",
    "frame-ancestors 'none'",
  ].join("; ")

  response.headers.set("Content-Security-Policy", csp)
  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
