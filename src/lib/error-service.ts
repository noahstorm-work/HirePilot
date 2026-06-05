// Client-side error logging helper
// This sets up global error handlers that send errors to our error-log API endpoint
// Server-side error logging is done directly in API routes via the /api/error-log endpoint

export function setupClientErrorLogging() {
  if (typeof window === "undefined") return;

  class ErrorService {
    /**
     * Log an error via the error-log API endpoint
     * @param error - The error object
     * @param context - Additional context information
     */
    static async logError(error: unknown, context: Record<string, any> = {}) {
      try {
        // Note: On client side, we don't have easy access to user ID without exposing auth token
        // We'll rely on server-side logging for user-specific errors when possible

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;

        await fetch("/api/error-log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            level: "error",
            message: errorMessage,
            stack: errorStack,
            user_id: null, // Client-side doesn't have easy access to user ID
            url:
              typeof window !== "undefined"
                ? window.location.href
                : undefined,
            user_agent:
              typeof window !== "undefined"
                ? navigator.userAgent
                : undefined,
            metadata: {
              ...context,
              timestamp: new Date().toISOString(),
            },
          }),
        });
      } catch (loggingError) {
        // If logging fails, we don't want to break the app
        console.error("Failed to log error:", loggingError);
        // Still log to console as fallback
        console.error("Original error:", error);
      }
    }

    /**
     * Log a warning via the error-log API endpoint
     * @param message - The warning message
     * @param context - Additional context information
     */
    static async logWarning(
      message: string,
      context: Record<string, any> = {}
    ) {
      try {
        await fetch("/api/error-log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            level: "warn",
            message,
            user_id: null, // Client-side doesn't have easy access to user ID
            url:
              typeof window !== "undefined"
                ? window.location.href
                : undefined,
            user_agent:
              typeof window !== "undefined"
                ? navigator.userAgent
                : undefined,
            metadata: {
              ...context,
              timestamp: new Date().toISOString(),
            },
          }),
        });
      } catch (loggingError) {
        // If logging fails, we don't want to break the app
        console.error("Failed to log warning:", loggingError);
        console.warn("Original warning:", message);
      }
    }

    /**
     * Log an info message via the error-log API endpoint
     * @param message - The info message
     * @param context - Additional context information
     */
    static async logInfo(
      message: string,
      context: Record<string, any> = {}
    ) {
      try {
        await fetch("/api/error-log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            level: "info",
            message,
            user_id: null, // Client-side doesn't have easy access to user ID
            url:
              typeof window !== "undefined"
                ? window.location.href
                : undefined,
            user_agent:
              typeof window !== "undefined"
                ? navigator.userAgent
                : undefined,
            metadata: {
              ...context,
              timestamp: new Date().toISOString(),
            },
          }),
        });
      } catch (loggingError) {
        // If logging fails, we don't want to break the app
        console.error("Failed to log info:", loggingError);
        console.info("Original info:", message);
      }
    }
  }

  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    ErrorService.logError(event.reason, {
      type: "unhandledrejection",
    }).catch((e) => console.error("Failed to log unhandledrejection:", e));
  });

  // Capture global errors
  window.onerror = (message, url, line, column, error) => {
    const err = error || new Error(String(message));
    ErrorService.logError(err, {
      type: "globalerror",
      url,
      line,
      column,
    }).catch((e) =>
      console.error("Failed to log global error:", e)
    );
    return false; // Let default handler run
  };
}