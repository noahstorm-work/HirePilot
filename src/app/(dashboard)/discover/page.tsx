import type { Metadata } from "next"
import { DiscoverClient } from "./client"

export const metadata: Metadata = {
  title: "Discover Jobs",
  description: "Search for jobs across multiple boards, save listings, and quick-apply with AI-powered analysis.",
}

export default function DiscoverPage() {
  return <DiscoverClient />
}
