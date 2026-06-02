// Client-side error logging helper
// This sets up global error handlers that send errors to our error-log API endpoint
// Server-side error logging is done directly in API routes via the /api/error-log endpoint

export function setupClientErrorLogging() {
  if (typeof window === "undefined") return;

  // Capture unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    // Send error to our error-log endpoint
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/error-log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level: "error",
        message: event.reason instanceof Error ? event.reason.message : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
        user_id: null, // Client-side doesn't have easy access to user ID
        url: window.location.href,
        user_agent: navigator.userAgent,
        metadata: {
          type: "unhandledrejection",
          timestamp: new Date().toISOString(),
        },
      }),
    }).catch((e) => console.error("Failed to log unhandledrejection:", e));
  });

  // Capture global errors
  window.onerror = (message, url, line, column, error) => {
    const err = error || new Error(message);
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/error-log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        level: "error",
        message: err.message,
        stack: err.stack,
        user_id: null, // Client-side doesn't have easy access to user ID
        url,
        user_agent: navigator.userAgent,
        metadata: {
          type: "globalerror",
          url,
          line,
          column,
          timestamp: new Date().toISOString(),
        },
      }),
    }).catch((e) =>
      console.error("Failed to log global error:", e)
    );
    return false; // Let default handler run
  };
}