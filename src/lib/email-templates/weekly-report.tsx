export function weeklyReportEmail(
  report: {
    skills_in_demand: string[]
    market_trends: string[]
    salary_ranges: { min: number; max: number; currency: string } | null
    recommendations: string[]
  },
  userName: string
): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hirepilot.app"
  const topSkills = report.skills_in_demand.slice(0, 3)
  const remainingSkills = report.skills_in_demand.slice(3)

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #0a0a0f; color: #e0e0e0; -webkit-text-size-adjust: 100%;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #1a0a2e 0%, #0f0520 100%); border-bottom: 1px solid rgba(124,58,237,0.3); padding: 32px 24px; text-align: center;">
    <div style="font-size: 28px; font-weight: 800; color: #7c3aed; letter-spacing: -0.5px; margin-bottom: 4px;">HirePilot</div>
    <div style="font-size: 11px; color: #6b5b95; letter-spacing: 2px; text-transform: uppercase;">AI Career Operating System</div>
    <h1 style="color: #ffffff; font-size: 22px; font-weight: 600; margin: 20px 0 6px;">Your Weekly Career Report</h1>
    <p style="color: #8b8ba3; font-size: 14px; margin: 0;">Hi ${userName}, here's your career intelligence for this week.</p>
  </div>

  <div style="padding: 24px;">

    <!-- Top Skills to Learn -->
    ${topSkills.length > 0 ? `
    <div style="margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 0 0 12px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 32px; height: 32px; background: rgba(124,58,237,0.15); border-radius: 8px; text-align: center; vertical-align: middle; font-size: 16px;">&#x1F3AF;</td>
                <td style="padding-left: 12px;">
                  <div style="color: #ffffff; font-size: 15px; font-weight: 600;">Top Skills to Learn</div>
                  <div style="color: #6b7280; font-size: 12px;">Based on market demand</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <div style="background: #12121a; border: 1px solid #1e1e2e; border-radius: 12px; padding: 20px;">
        ${topSkills.map((s, i) => `
        <table style="width: 100%; border-collapse: collapse; ${i > 0 ? "margin-top: 12px;" : ""}">
          <tr>
            <td style="width: 28px; height: 28px; background: ${i === 0 ? "#7c3aed" : i === 1 ? "#6d28d9" : "#5b21b6"}; border-radius: 50%; text-align: center; vertical-align: middle; color: #fff; font-size: 12px; font-weight: 700;">${i + 1}</td>
            <td style="padding-left: 12px; color: #e0e0e0; font-size: 14px; font-weight: 500;">${s}</td>
          </tr>
        </table>`).join("")}
        ${remainingSkills.length > 0 ? `
        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #1e1e2e;">
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${remainingSkills.map(s => `<span style="background: rgba(124,58,237,0.08); color: #9b8ec4; padding: 3px 10px; border-radius: 16px; font-size: 11px; border: 1px solid rgba(124,58,237,0.15);">${s}</span>`).join("")}
          </div>
        </div>` : ""}
      </div>
    </div>` : ""}

    <!-- Market Trends -->
    ${report.market_trends.length > 0 ? `
    <div style="margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 0 0 12px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 32px; height: 32px; background: rgba(59,130,246,0.15); border-radius: 8px; text-align: center; vertical-align: middle; font-size: 16px;">&#x1F4C8;</td>
                <td style="padding-left: 12px;">
                  <div style="color: #ffffff; font-size: 15px; font-weight: 600;">Market Trends</div>
                  <div style="color: #6b7280; font-size: 12px;">What's shaping your market</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <div style="background: #12121a; border: 1px solid #1e1e2e; border-radius: 12px; padding: 20px;">
        ${report.market_trends.map((t, i) => `
        <table style="width: 100%; border-collapse: collapse; ${i > 0 ? "margin-top: 12px;" : ""}">
          <tr>
            <td style="width: 6px; min-height: 6px; background: #3b82f6; border-radius: 3px; vertical-align: top; margin-top: 6px;"></td>
            <td style="padding-left: 12px; color: #d1d5db; font-size: 14px; line-height: 1.5;">${t}</td>
          </tr>
        </table>`).join("")}
      </div>
    </div>` : ""}

    <!-- Salary Range -->
    ${report.salary_ranges ? `
    <div style="margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 0 0 12px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 32px; height: 32px; background: rgba(16,185,129,0.15); border-radius: 8px; text-align: center; vertical-align: middle; font-size: 16px;">&#x1F4B0;</td>
                <td style="padding-left: 12px;">
                  <div style="color: #ffffff; font-size: 15px; font-weight: 600;">Estimated Salary Range</div>
                  <div style="color: #6b7280; font-size: 12px;">For your target role</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <div style="background: #12121a; border: 1px solid #1e1e2e; border-radius: 12px; padding: 20px; text-align: center;">
        <div style="font-size: 26px; font-weight: 800; color: #10b981; letter-spacing: -0.5px;">
          ${report.salary_ranges.currency} ${report.salary_ranges.min.toLocaleString()}
          <span style="color: #6b7280; font-weight: 400; font-size: 18px; padding: 0 8px;">&mdash;</span>
          ${report.salary_ranges.currency} ${report.salary_ranges.max.toLocaleString()}
        </div>
      </div>
    </div>` : ""}

    <!-- Recommendations -->
    ${report.recommendations.length > 0 ? `
    <div style="margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 0 0 12px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 32px; height: 32px; background: rgba(168,85,247,0.15); border-radius: 8px; text-align: center; vertical-align: middle; font-size: 16px;">&#x2728;</td>
                <td style="padding-left: 12px;">
                  <div style="color: #ffffff; font-size: 15px; font-weight: 600;">Recommendations</div>
                  <div style="color: #6b7280; font-size: 12px;">Personalized action items</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <div style="background: #12121a; border: 1px solid #1e1e2e; border-radius: 12px; padding: 20px;">
        ${report.recommendations.map((r, i) => `
        <table style="width: 100%; border-collapse: collapse; ${i > 0 ? "margin-top: 12px;" : ""}">
          <tr>
            <td style="width: 24px; height: 24px; background: rgba(168,85,247,0.2); border-radius: 6px; text-align: center; vertical-align: middle; color: #a855f7; font-size: 11px; font-weight: 700;">${i + 1}</td>
            <td style="padding-left: 12px; color: #d1d5db; font-size: 14px; line-height: 1.5;">${r}</td>
          </tr>
        </table>`).join("")}
      </div>
    </div>` : ""}

    <!-- Quick Actions -->
    <div style="margin-bottom: 20px;">
      <div style="background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(59,130,246,0.08) 100%); border: 1px solid rgba(124,58,237,0.25); border-radius: 12px; padding: 24px; text-align: center;">
        <div style="color: #ffffff; font-size: 15px; font-weight: 600; margin-bottom: 6px;">Quick Actions</div>
        <div style="color: #8b8ba3; font-size: 13px; margin-bottom: 20px;">Keep your job search momentum going</div>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: center; padding: 0 6px;">
              <a href="${siteUrl}/discover" style="display: block; background: #7c3aed; color: #fff; text-decoration: none; padding: 10px 12px; border-radius: 8px; font-size: 12px; font-weight: 600;">Discover Jobs</a>
            </td>
            <td style="text-align: center; padding: 0 6px;">
              <a href="${siteUrl}/profile" style="display: block; background: rgba(124,58,237,0.15); color: #a78bfa; text-decoration: none; padding: 10px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; border: 1px solid rgba(124,58,237,0.3);">Update CV</a>
            </td>
            <td style="text-align: center; padding: 0 6px;">
              <a href="${siteUrl}/dashboard" style="display: block; background: rgba(124,58,237,0.15); color: #a78bfa; text-decoration: none; padding: 10px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; border: 1px solid rgba(124,58,237,0.3);">Dashboard</a>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${siteUrl}/dashboard/insights" style="display: inline-block; background: #7c3aed; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;">View Full Report</a>
    </div>

  </div>

  <!-- Footer -->
  <div style="border-top: 1px solid #1e1e2e; padding: 20px 24px; text-align: center;">
    <div style="color: #4b5563; font-size: 12px; line-height: 1.6;">
      <p style="margin: 0 0 8px;">Sent from <span style="color: #7c3aed; font-weight: 600;">HirePilot</span> &mdash; Your AI Career Operating System</p>
      <p style="margin: 0;">You're receiving this because you opted in to weekly reports.<br>
      <a href="${siteUrl}/profile" style="color: #6b7280; text-decoration: underline;">Manage preferences</a></p>
    </div>
  </div>

</body>
</html>`
}
