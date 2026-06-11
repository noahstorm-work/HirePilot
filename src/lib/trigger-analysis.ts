import { logError } from "@/lib/error-service"

export async function triggerAnalysis(
  applicationId: string,
  jobDescription: string,
  company: string,
  roleTitle: string
): Promise<void> {
  try {
    await fetch("/api/ai/analyze-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        application_id: applicationId,
        job_description: jobDescription,
        company,
        role_title: roleTitle,
      }),
    })
  } catch (error) {
    logError("Trigger analysis failed", error instanceof Error ? error.message : String(error), "trigger-analysis")
  }
}
