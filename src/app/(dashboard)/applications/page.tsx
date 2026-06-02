import { createClient } from "@/lib/supabase/server"
import { Navbar } from "@/components/Navbar"
import { KanbanBoard } from "@/components/applications/KanbanBoard"
import { AddApplicationModal } from "@/components/AddApplicationModal"
import type { Application } from "@/types"

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: applications } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const grouped = {
    Saved: (applications as Application[] ?? []).filter((a) => a.status === "Saved"),
    Applied: (applications as Application[] ?? []).filter((a) => a.status === "Applied"),
    Interview: (applications as Application[] ?? []).filter((a) => a.status === "Interview"),
    Offer: (applications as Application[] ?? []).filter((a) => a.status === "Offer"),
    Rejected: (applications as Application[] ?? []).filter((a) => a.status === "Rejected"),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track your job applications through the pipeline
            </p>
          </div>
          <AddApplicationModal />
        </div>

        <KanbanBoard
          saved={grouped.Saved}
          applied={grouped.Applied}
          interview={grouped.Interview}
          offer={grouped.Offer}
          rejected={grouped.Rejected}
        />
      </main>
    </div>
  )
}
