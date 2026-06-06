"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <div className="inline-flex p-3 rounded-2xl bg-[var(--color-accent-rose)]/10 mb-4">
          <AlertTriangle className="h-6 w-6 text-[var(--color-accent-rose)]" />
        </div>
        <h1 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-2">Something went wrong</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <Button
          onClick={reset}
          className="gradient-violet text-white border-0 hover:opacity-90 shadow-glow"
        >
          Try Again
        </Button>
      </div>
    </div>
  )
}
