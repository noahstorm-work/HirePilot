import type { Metadata } from "next"
import { InsightsClient } from "./client"

export const metadata: Metadata = {
  title: "Insights",
  description: "Track your job search progress with application funnel, career health metrics, and AI-powered weekly reports.",
}

export default function InsightsPage() {
  return <InsightsClient />
}
