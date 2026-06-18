"use client"

import DashboardError from "@/components/ui/dashboard-error"
function OnboardingError(props: React.ComponentProps<typeof DashboardError>) {
  return <DashboardError {...props} context="onboarding-error-boundary" />
}
export default OnboardingError
