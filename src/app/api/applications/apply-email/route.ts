import { withAuth, apiSuccess, apiError, validateBody, checkRateLimit } from "@/lib/api-handler"
import { z } from "zod"
import { Resend } from "resend"

const schema = z.object({
  application_id: z.string().uuid(),
  to_email: z.string().email(),
  company: z.string().min(1),
  role_title: z.string().min(1),
})

export const POST = withAuth(async (request, { supabase, user }) => {
  const rl = checkRateLimit(`email:${user.id}`, 5, 60_000)
  if (rl) return rl
  const body = await request.json()
  const parsed = validateBody(schema, body)
  if (parsed.error) return parsed.error

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return apiError("Email not configured — RESEND_API_KEY missing", 500)

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, cv_text")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile?.cv_text) return apiError("Please add your CV in Profile first", 400)

  const { data: aiResult } = await supabase
    .from("ai_results")
    .select("cover_letter")
    .eq("application_id", parsed.data.application_id)
    .maybeSingle()

  const candidateName = profile.full_name || "Applicant"
  const candidateEmail = user.email || ""
  const coverLetter = aiResult?.cover_letter || `Dear Hiring Manager,

I am writing to express my strong interest in the ${parsed.data.role_title} position at ${parsed.data.company}. With my background and skills, I am confident I would be a valuable addition to your team.

I have attached my CV for your review. I would welcome the opportunity to discuss how my experience aligns with your needs.

Thank you for your consideration.

Best regards,
${candidateName}
${candidateEmail}`

  const resend = new Resend(apiKey)
  const fromAddress = process.env.EMAIL_FROM || "HirePilot Apply <apply@hirepilot.app>"

  try {
    const cvBuffer = Buffer.from(profile.cv_text.replace(/<[^>]*>/g, "").trim(), "utf-8")
    const cvBase64 = cvBuffer.toString("base64")

    await resend.emails.send({
      from: fromAddress,
      to: parsed.data.to_email,
      subject: `Application for ${parsed.data.role_title} at ${parsed.data.company}`,
      text: coverLetter.replace(/<[^>]*>/g, ""),
      attachments: [
        {
          filename: `CV_${candidateName.replace(/\s+/g, "_")}.txt`,
          content: cvBase64,
        },
      ],
    })

    await supabase.from("applications").update({
      notes: `Application email sent to ${parsed.data.to_email} on ${new Date().toISOString().split("T")[0]}`,
    }).eq("id", parsed.data.application_id).eq("user_id", user.id)

    return apiSuccess({ sent: true, to: parsed.data.to_email })
  } catch (err) {
    console.error("Failed to send application email:", err)
    return apiError("Failed to send application email", 500)
  }
})
