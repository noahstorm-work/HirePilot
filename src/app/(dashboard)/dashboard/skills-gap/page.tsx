import type { Metadata } from "next"
import { SkillsGapClient } from "./client"

export const metadata: Metadata = {
  title: "Skills Gap",
  description: "Track missing skills, keywords, and experience areas identified from your career analysis.",
}

export default function SkillsGapPage() {
  return <SkillsGapClient />
}
