import { describe, it, expect } from "vitest"
import { detectCurrency, formatSalary, extractApplyEmail } from "@/lib/jobs/types"

describe("detectCurrency", () => {
  it("returns $ for US locations", () => {
    expect(detectCurrency("New York, NY")).toEqual({ symbol: "$", code: "USD" })
    expect(detectCurrency("San Francisco, California")).toEqual({ symbol: "$", code: "USD" })
  })

  it("returns £ for UK locations", () => {
    expect(detectCurrency("London, UK")).toEqual({ symbol: "£", code: "GBP" })
    expect(detectCurrency("Manchester, England")).toEqual({ symbol: "£", code: "GBP" })
  })

  it("returns € for EU locations", () => {
    expect(detectCurrency("Berlin, Germany")).toEqual({ symbol: "€", code: "EUR" })
    expect(detectCurrency("Paris, France")).toEqual({ symbol: "€", code: "EUR" })
  })

  it("returns $ as default for unknown locations", () => {
    expect(detectCurrency("Remote")).toEqual({ symbol: "$", code: "USD" })
    expect(detectCurrency("")).toEqual({ symbol: "$", code: "USD" })
  })
})

describe("formatSalary", () => {
  it("formats salary range with currency symbol from location", () => {
    const result = formatSalary(80000, 120000, "USD", "New York, US")
    expect(result).toContain("80k")
    expect(result).toContain("120k")
    expect(result).toContain("$")
  })

  it("formats UK salary with £", () => {
    const result = formatSalary(50000, 70000, "GBP", "London, UK")
    expect(result).toContain("£")
  })

  it("returns null for no salary", () => {
    expect(formatSalary(null, null, "USD", "US")).toBeNull()
  })

  it("formats single min salary", () => {
    const result = formatSalary(95000, null, "USD", "US")
    expect(result).toContain("95k")
  })
})

describe("extractApplyEmail", () => {
  it("extracts email from text", () => {
    expect(extractApplyEmail("Send resume to jobs@realcompany.com")).toBe("jobs@realcompany.com")
    expect(extractApplyEmail("Apply at hr@company.co.uk please")).toBe("hr@company.co.uk")
  })

  it("returns null when no email found", () => {
    expect(extractApplyEmail("No email here")).toBeNull()
    expect(extractApplyEmail("")).toBeNull()
  })

  it("skips excluded domains", () => {
    expect(extractApplyEmail("Contact support@sentry.io")).toBeNull()
    expect(extractApplyEmail("Email test@example.com")).toBeNull()
  })

  it("returns first valid email when multiple present", () => {
    expect(extractApplyEmail("first@realcompany.com or second@test.org")).toBe("first@realcompany.com")
  })
})
