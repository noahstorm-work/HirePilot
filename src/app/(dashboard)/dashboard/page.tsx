import type { Metadata } from "next"
import { DashboardClient } from "./client"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your career health dashboard with interview readiness score, application pipeline, and improvement recommendations.",
}

export default function DashboardPage() {
  return <DashboardClient />
}
