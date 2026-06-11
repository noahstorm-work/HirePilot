import type { Metadata } from "next"
import { ApplicationDetailClient } from "./client"

export const metadata: Metadata = {
  title: "Application Details",
  description: "View and manage your job application with AI analysis, cover letter, follow-up email, and rejection insights.",
}

export default function ApplicationDetailPage() {
  return <ApplicationDetailClient />
}
