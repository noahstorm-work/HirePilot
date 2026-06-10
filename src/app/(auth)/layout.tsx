export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-[var(--color-bg-primary)]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-[var(--color-accent-violet)]/6 rounded-full blur-[120px]" />
      </div>
      <div className="relative w-full max-w-[400px]">
        {children}
      </div>
    </div>
  )
}
