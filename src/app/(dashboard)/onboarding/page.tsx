import type { Metadata } from "next"
import { OnboardingClient } from "./client"

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Set up your HirePilot profile to get personalized career insights.",
}

export default function OnboardingPage() {
  return <OnboardingClient />
}
