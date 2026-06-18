"use client"

import DashboardError from "@/components/ui/dashboard-error"
function LoginError(props: React.ComponentProps<typeof DashboardError>) {
  return <DashboardError {...props} context="login-error-boundary" />
}
export default LoginError
