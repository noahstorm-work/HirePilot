import type { Metadata } from "next"
import { RateLimitsClient } from "./client"

export const metadata: Metadata = {
  title: "Rate Limits",
  description: "View rate limit configuration and API usage limits for all endpoints.",
}

export default function RateLimitsPage() {
  return <RateLimitsClient />
}
