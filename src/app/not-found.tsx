import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <p className="text-5xl font-bold font-[family-name:var(--font-display)] gradient-text-violet mb-4">404</p>
        <h1 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-2">Page not found</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold gradient-violet text-white hover:opacity-90 shadow-glow transition-opacity"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
