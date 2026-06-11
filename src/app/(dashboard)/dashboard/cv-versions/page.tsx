import type { Metadata } from "next"
import { CVVersionsClient } from "./client"

export const metadata: Metadata = {
  title: "CV Versions",
  description: "Track and compare different versions of your CV to measure improvement over time.",
}

export default function CVVersionsPage() {
  return <CVVersionsClient />
}
