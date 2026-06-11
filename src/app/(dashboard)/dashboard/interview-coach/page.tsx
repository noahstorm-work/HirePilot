import type { Metadata } from "next"
import { InterviewCoachClient } from "./client"

export const metadata: Metadata = {
  title: "Interview Coach",
  description: "Generate tailored interview questions, STAR responses, and company-specific preparation strategies with AI.",
}

export default function InterviewCoachPage() {
  return <InterviewCoachClient />
}
