import { describe, it, expect } from "vitest"
import { weeklyReportEmail } from "@/lib/email-templates/weekly-report"

const mockReport = {
  skills_in_demand: ["React", "TypeScript", "AWS"],
  market_trends: ["Remote roles growing 20% YoY", "AI/ML skills in demand"],
  salary_ranges: { min: 80000, max: 120000, currency: "$" },
  recommendations: [
    "Update LinkedIn with recent project",
    "Apply to top 5 matches this week",
  ],
}

describe("weeklyReportEmail", () => {
  it("returns an HTML string", () => {
    const html = weeklyReportEmail(mockReport, "Alice")
    expect(html).toContain("<!DOCTYPE html>")
    expect(html).toContain("</html>")
  })

  it("includes the user name in the greeting", () => {
    const html = weeklyReportEmail(mockReport, "Alice")
    expect(html).toContain("Alice")
  })

  it("renders skills in demand as badges", () => {
    const html = weeklyReportEmail(mockReport, "Alice")
    expect(html).toContain("React")
    expect(html).toContain("TypeScript")
    expect(html).toContain("AWS")
  })

  it("renders market trends as list items", () => {
    const html = weeklyReportEmail(mockReport, "Alice")
    expect(html).toContain("Remote roles growing 20% YoY")
    expect(html).toContain("AI/ML skills in demand")
  })

  it("renders recommendations as list items", () => {
    const html = weeklyReportEmail(mockReport, "Alice")
    expect(html).toContain("Update LinkedIn with recent project")
    expect(html).toContain("Apply to top 5 matches this week")
  })

  it("renders salary section when salary_ranges is provided", () => {
    const html = weeklyReportEmail(mockReport, "Alice")
    expect(html).toContain("Estimated Salary Range")
    expect(html).toContain("80,000")
    expect(html).toContain("120,000")
  })

  it("omits salary section when salary_ranges is null", () => {
    const reportNoSalary = { ...mockReport, salary_ranges: null }
    const html = weeklyReportEmail(reportNoSalary, "Bob")
    expect(html).not.toContain("Estimated Salary Range")
    expect(html).not.toContain("80,000")
  })

  it("handles empty arrays gracefully", () => {
    const emptyReport = {
      skills_in_demand: [],
      market_trends: [],
      salary_ranges: null,
      recommendations: [],
    }
    const html = weeklyReportEmail(emptyReport, "Carol")
    expect(html).toContain("Carol")
    expect(html).toContain("Your Weekly Career Report")
  })

  it("handles salary ranges with 0 min and max", () => {
    const reportZeroSalary = {
      ...mockReport,
      salary_ranges: { min: 0, max: 0, currency: "$" },
    }
    const html = weeklyReportEmail(reportZeroSalary, "Dave")
    expect(html).toContain("Estimated Salary Range")
    expect(html).toContain("$ 0 - 0")
  })
})
