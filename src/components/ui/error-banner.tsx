"use client"

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="p-2.5 rounded-lg bg-[var(--color-accent-rose)]/10 border border-[var(--color-accent-rose)]/20">
      <p className="text-[11px] text-[var(--color-accent-rose)]">{message}</p>
    </div>
  )
}
