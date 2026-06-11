import type { Metadata } from "next"
import { ApplicationsClient } from "./client"

export const metadata: Metadata = {
  title: "Applications",
  description: "Manage your job application pipeline with kanban board, tracking status from saved to offer.",
}

export default function ApplicationsPage() {
  return <ApplicationsClient />
}
