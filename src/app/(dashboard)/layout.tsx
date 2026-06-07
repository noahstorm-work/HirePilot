import { Sidebar } from "@/components/Sidebar"
import { AuthGuard } from "@/components/AuthGuard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[var(--color-accent-violet)] focus:text-white focus:text-sm">
        Skip to main content
      </a>
      <div className="min-h-screen bg-[var(--color-bg-primary)]">
        <Sidebar />
        <main id="main-content" className="md:pl-[240px] md:peer-[]:pl-[68px] min-h-screen transition-[padding] duration-300">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 md:pt-8 pb-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
