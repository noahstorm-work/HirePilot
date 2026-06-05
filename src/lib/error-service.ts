// Client-side error logging helper
// Sends errors to the /api/error-log endpoint which stores them in Supabase

export function setupClientErrorLogging() {
  if (typeof window === "undefined") return;

  class ErrorService {
    private static async log(level: string, message: string, context: Record<string, any> = {}) {
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

    static async logError(error: unknown, context: Record<string, any> = {}) {
      const message = error instanceof Error ? error.message : String(error)
      const stack = error instanceof Error ? error.stack : undefined
      await this.log("error", message, { ...context, stack })
    }

    static async logWarning(message: string, context: Record<string, any> = {}) {
      await this.log("warn", message, context)
    }

    static async logInfo(message: string, context: Record<string, any> = {}) {
      await this.log("info", message, context)
    }
  }

  window.addEventListener("unhandledrejection", (event) => {
    ErrorService.logError(event.reason, { type: "unhandledrejection" }).catch(() => {})
  })

  window.onerror = (message, url, line, column, error) => {
    const err = error || new Error(String(message))
    ErrorService.logError(err, { type: "globalerror", url, line, column }).catch(() => {})
    return false
  }
}
