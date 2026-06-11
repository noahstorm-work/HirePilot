export function weeklyReportEmail(
  report: {
    skills_in_demand: string[]
    market_trends: string[]
    salary_ranges: { min: number; max: number; currency: string } | null
    recommendations: string[]
  },
  userName: string
): string {
  const salarySection = report.salary_ranges
    ? `<div style="background: #12121a; border: 1px solid #1e1e2e; border-radius: 12px; padding: 24px; margin: 16px 0;">
    <h2 style="color: #10b981; font-size: 16px; margin: 0 0 12px;">Estimated Salary Range</h2>
    <p style="font-size: 18px; font-weight: bold; color: #10b981; margin: 0;">
      ${report.salary_ranges.currency} ${report.salary_ranges.min.toLocaleString()} - ${report.salary_ranges.max.toLocaleString()}
    </p>
  </div>`
    : ""

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0f; color: #e0e0e0;">
  <div style="text-align: center; padding: 30px 0;">
    <h1 style="color: #7c3aed; font-size: 24px; margin: 0;">Your Weekly Career Report</h1>
    <p style="color: #888; font-size: 14px;">Hi ${userName}, here's your career intelligence for this week.</p>
  </div>
  
  <div style="background: #12121a; border: 1px solid #1e1e2e; border-radius: 12px; padding: 24px; margin: 16px 0;">
    <h2 style="color: #7c3aed; font-size: 16px; margin: 0 0 12px;">Skills in Demand</h2>
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      ${report.skills_in_demand.map(s => `<span style="background: rgba(124,58,237,0.1); color: #7c3aed; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${s}</span>`).join("")}
    </div>
  </div>
  
  <div style="background: #12121a; border: 1px solid #1e1e2e; border-radius: 12px; padding: 24px; margin: 16px 0;">
    <h2 style="color: #3b82f6; font-size: 16px; margin: 0 0 12px;">Market Trends</h2>
    <ul style="margin: 0; padding-left: 20px;">
      ${report.market_trends.map(t => `<li style="font-size: 14px; margin: 4px 0;">${t}</li>`).join("")}
    </ul>
  </div>

  ${salarySection}

  <div style="background: #12121a; border: 1px solid #1e1e2e; border-radius: 12px; padding: 24px; margin: 16px 0;">
    <h2 style="color: #10b981; font-size: 16px; margin: 0 0 12px;">Recommendations</h2>
    <ul style="margin: 0; padding-left: 20px;">
      ${report.recommendations.map(r => `<li style="font-size: 14px; margin: 4px 0;">${r}</li>`).join("")}
    </ul>
  </div>
  
  <div style="text-align: center; padding: 20px 0; color: #666; font-size: 12px;">
    <p>Sent from HirePilot AI — Your AI Career Operating System</p>
  </div>
</body>
</html>`
}
