import { describe, it, expect } from "vitest"
import { calculateSkillMatch } from "@/lib/skill-match"

describe("calculateSkillMatch - edge cases", () => {
  it("returns 0 when skills array is empty", () => {
    expect(calculateSkillMatch([], "React TypeScript developer")).toBe(0)
  })

  it("returns 0 when job text is empty", () => {
    expect(calculateSkillMatch(["React", "TypeScript"], "")).toBe(0)
  })

  it("returns 0 when both are empty", () => {
    expect(calculateSkillMatch([], "")).toBe(0)
  })

  it("returns 100 when all skills match", () => {
    expect(calculateSkillMatch(["React", "TypeScript"], "React and TypeScript developer")).toBe(100)
  })

  it("returns partial match for some skills", () => {
    const score = calculateSkillMatch(["React", "Python", "AWS"], "React developer with TypeScript")
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(100)
  })

  it("is case insensitive", () => {
    expect(calculateSkillMatch(["react"], "REACT developer")).toBe(100)
    expect(calculateSkillMatch(["REACT"], "react developer")).toBe(100)
    expect(calculateSkillMatch(["React"], "REACT")).toBe(100)
  })

  it("returns 0 when no skills match", () => {
    expect(calculateSkillMatch(["Rust", "Go"], "React developer")).toBe(0)
  })

  it("caps at 100 even with many matching skills", () => {
    const skills = Array.from({ length: 20 }, (_, i) => `skill${i}`)
    const text = skills.join(" ")
    expect(calculateSkillMatch(skills, text)).toBe(100)
  })

  it("handles very long job descriptions", () => {
    const longText = "React " + "TypeScript ".repeat(1000) + "AWS developer"
    expect(calculateSkillMatch(["React", "TypeScript", "AWS"], longText)).toBe(100)
  })

  it("handles special characters in skills", () => {
    expect(calculateSkillMatch(["C++"], "C++ developer")).toBe(100)
    expect(calculateSkillMatch(["C#"], "C# developer")).toBe(100)
    expect(calculateSkillMatch([".NET"], ".NET framework")).toBe(100)
    expect(calculateSkillMatch(["Node.js"], "Node.js backend")).toBe(100)
  })

  it("handles skills with spaces", () => {
    expect(calculateSkillMatch(["Machine Learning"], "Machine Learning engineer")).toBe(100)
    expect(calculateSkillMatch(["Deep Learning"], "Machine Learning engineer")).toBe(0)
  })

  it("handles unicode in skills", () => {
    expect(calculateSkillMatch(["über"], "über developer")).toBe(100)
    expect(calculateSkillMatch(["日本語"], "日本語 knowledge")).toBe(100)
  })

  it("handles single skill", () => {
    expect(calculateSkillMatch(["React"], "React developer")).toBe(100)
    expect(calculateSkillMatch(["React"], "Vue developer")).toBe(0)
  })

  it("handles skill that is substring of a word in job text", () => {
    expect(calculateSkillMatch(["act"], "React developer")).toBe(100)
  })

  it("returns correct percentage for partial matches", () => {
    const score = calculateSkillMatch(
      ["React", "TypeScript", "Python"],
      "React and TypeScript developer"
    )
    expect(score).toBe(67)
  })

  it("rounds correctly for fractional percentages", () => {
    const score = calculateSkillMatch(
      ["A", "B", "C", "D", "E"],
      "A B C"
    )
    expect(score).toBe(60)
  })

  it("handles job text with no spaces", () => {
    expect(calculateSkillMatch(["React"], "React")).toBe(100)
    expect(calculateSkillMatch(["React"], "ReactTypeScript")).toBe(100)
  })

  it("handles whitespace-only job text", () => {
    expect(calculateSkillMatch(["React"], "   ")).toBe(0)
  })
})
