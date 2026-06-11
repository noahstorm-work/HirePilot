import type { Metadata } from "next"
import { ATSCheckerClient } from "./client"

export const metadata: Metadata = {
  title: "ATS Checker",
  description: "Scan your CV against ATS systems and get optimization tips to improve your resume's pass rate.",
}

export default function ATSCheckerPage() {
  return <ATSCheckerClient />
}
