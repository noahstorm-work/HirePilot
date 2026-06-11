import type { Metadata } from "next"
import { CareerAnalysisClient } from "./client"

export const metadata: Metadata = {
  title: "Career Analysis",
  description: "AI-powered analysis of your career readiness with interview readiness score, skills gaps, and a 30-day improvement plan.",
}

export default function CareerAnalysisPage() {
  return <CareerAnalysisClient />
}
