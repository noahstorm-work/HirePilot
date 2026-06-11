import type { Metadata } from "next"
import { AdminErrorsClient } from "./client"

export const metadata: Metadata = {
  title: "Error Logs",
  description: "View application error logs",
}

export default function AdminErrorsPage() {
  return <AdminErrorsClient />
}
