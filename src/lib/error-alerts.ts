import { Resend } from "resend"

const recentAlerts = new Map<string, number>()
const RATE_LIMIT_MS = 5 * 60 * 1000

function getErrorKey(message: string, level: string): string {
  return `${level}:${message.slice(0, 200)}`
}

export async function sendErrorAlert(error: {
  message: string
  level: string
  url?: string
}): Promise<void> {
  if (error.level !== "error") return

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return

  const key = getErrorKey(error.message, error.level)
  const now = Date.now()
  const lastSent = recentAlerts.get(key)
  if (lastSent && now - lastSent < RATE_LIMIT_MS) return

  recentAlerts.set(key, now)
  if (recentAlerts.size > 200) {
    const cutoff = now - RATE_LIMIT_MS
    for (const [k, v] of recentAlerts) {
      if (v < cutoff) recentAlerts.delete(k)
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "HirePilot <apply@hirepilot.app>",
      to: adminEmail,
      subject: `[HirePilot Alert] ${error.level.toUpperCase()}: ${error.message.slice(0, 100)}`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0f; color: #e0e0e0;">
  <div style="background: #1a0a2e; border: 1px solid #7c3aed; border-radius: 12px; padding: 24px; margin-bottom: 16px;">
    <h1 style="color: #7c3aed; font-size: 18px; margin: 0 0 8px;">HirePilot Error Alert</h1>
    <p style="color: #888; font-size: 13px; margin: 0;">Automated error notification</p>
  </div>

  <div style="background: #12121a; border: 1px solid #1e1e2e; border-radius: 12px; padding: 24px; margin: 16px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #888; font-size: 13px; width: 100px;">Level</td>
        <td style="padding: 8px 0; font-size: 14px;">
          <span style="background: rgba(239,68,68,0.15); color: #ef4444; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${error.level}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #888; font-size: 13px;">Message</td>
        <td style="padding: 8px 0; font-size: 14px; color: #e0e0e0; word-break: break-word;">${error.message}</td>
      </tr>
      ${error.url ? `
      <tr>
        <td style="padding: 8px 0; color: #888; font-size: 13px;">URL</td>
        <td style="padding: 8px 0; font-size: 14px;">
          <a href="${error.url}" style="color: #7c3aed; text-decoration: none;">${error.url.length > 80 ? error.url.slice(0, 80) + "..." : error.url}</a>
        </td>
      </tr>` : ""}
      <tr>
        <td style="padding: 8px 0; color: #888; font-size: 13px;">Time</td>
        <td style="padding: 8px 0; font-size: 14px;">${new Date().toISOString()}</td>
      </tr>
    </table>
  </div>

  <div style="text-align: center; padding: 16px 0; color: #555; font-size: 11px;">
    <p style="margin: 0;">HirePilot Error Monitoring</p>
  </div>
</body>
</html>`,
    })
  } catch (err) {
    console.error("Failed to send error alert email:", err)
  }
}
