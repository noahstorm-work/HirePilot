import { Sidebar } from "@/components/Sidebar"
import { AuthGuard } from "@/components/AuthGuard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#09090b]">
        <Sidebar />
        <main className="md:pl-60 min-h-screen">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 md:pt-8 pb-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
