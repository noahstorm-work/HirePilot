// Client-side error logging helper
// Sends errors to the /api/error-log endpoint which stores them in Supabase

async function log(level: string, message: string, context: Record<string, unknown> = {}) {
  try {
    await fetch("/api/error-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level,
        message,
        user_id: null,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        user_agent: typeof window !== "undefined" ? navigator.userAgent : undefined,
        metadata: { ...context, timestamp: new Date().toISOString() },
      }),
    })
  } catch (loggingError) {
    if (level === "error") console.error("Failed to log error:", loggingError)
  }
}

export async function logError(message: string, stack?: string, context?: string) {
  await log("error", message, { stack, context })
}

export function setupClientErrorLogging() {
  if (typeof window === "undefined") return

  window.addEventListener("unhandledrejection", (event) => {
    const msg = event.reason instanceof Error ? event.reason.message : String(event.reason)
    const stack = event.reason instanceof Error ? event.reason.stack : undefined
    logError(msg, stack, "unhandledrejection").catch(() => {})
  })

  window.onerror = (message, url, line, column, error) => {
    const err = error || new Error(String(message))
    logError(err.message, err.stack, `globalerror:${url}:${line}:${column}`).catch(() => {})
    return false
  }
}
