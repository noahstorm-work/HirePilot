"use client"

import DashboardError from "@/components/ui/dashboard-error"
function ForgotPasswordError(props: React.ComponentProps<typeof DashboardError>) {
  return <DashboardError {...props} context="forgot-password-error-boundary" />
}
export default ForgotPasswordError
