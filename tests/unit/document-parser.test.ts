import { describe, it, expect } from "vitest"
import { extractMetadata } from "@/lib/document-parser"

describe("extractMetadata", () => {
  it("extracts LinkedIn URL", () => {
    const text = "Check my profile https://linkedin.com/in/johndoe"
    const meta = extractMetadata(text)
    expect(meta.linkedin_url).toBe("https://linkedin.com/in/johndoe")
  })

  it("extracts GitHub URL", () => {
    const text = "My code https://github.com/johndoe"
    const meta = extractMetadata(text)
    expect(meta.github_url).toBe("https://github.com/johndoe")
  })

  it("extracts portfolio URL (non-known domain)", () => {
    const text = "Portfolio: https://johndoe.dev/projects"
    const meta = extractMetadata(text)
    expect(meta.portfolio_url).toBe("https://johndoe.dev/projects")
  })

  it("does not extract known domain as portfolio", () => {
    const text = "Profile https://linkedin.com/in/johndoe"
    const meta = extractMetadata(text)
    expect(meta.portfolio_url).toBeUndefined()
  })

  it("extracts full name from first line", () => {
    const text = "John Doe\nSoftware Engineer\nExperience..."
    const meta = extractMetadata(text)
    expect(meta.full_name).toBe("John Doe")
  })

  it("skips noise words for name", () => {
    const text = "Contact\nSkills\nJohn Doe\nExperience..."
    const meta = extractMetadata(text)
    expect(meta.full_name).toBe("John Doe")
  })

  it("extracts skills from skills section", () => {
    const text = "John Doe\n\nSkills:\nJavaScript\nTypeScript\nReact\nNode.js\n\nExperience..."
    const meta = extractMetadata(text)
    expect(meta.skills).toContain("JavaScript")
    expect(meta.skills).toContain("TypeScript")
    expect(meta.skills).toContain("React")
  })

  it("returns empty object for minimal text", () => {
    const meta = extractMetadata("Hello world")
    expect(meta.full_name).toBeUndefined()
    expect(meta.linkedin_url).toBeUndefined()
  })
})
