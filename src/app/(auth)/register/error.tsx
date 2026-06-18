"use client"

import DashboardError from "@/components/ui/dashboard-error"
function RegisterError(props: React.ComponentProps<typeof DashboardError>) {
  return <DashboardError {...props} context="register-error-boundary" />
}
export default RegisterError
