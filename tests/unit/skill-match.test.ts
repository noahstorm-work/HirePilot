import { describe, it, expect } from "vitest"
import { calculateSkillMatch } from "@/lib/skill-match"

describe("calculateSkillMatch", () => {
  it("returns 0 when no skills provided", () => {
    expect(calculateSkillMatch([], "React TypeScript")).toBe(0)
  })

  it("returns 0 when no job text provided", () => {
    expect(calculateSkillMatch(["React"], "")).toBe(0)
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
  })

  it("returns 0 when no skills match", () => {
    expect(calculateSkillMatch(["Rust", "Go"], "React developer")).toBe(0)
  })

  it("caps at 100 even with many skills", () => {
    const skills = Array.from({ length: 20 }, (_, i) => `skill${i}`)
    const text = skills.join(" ")
    expect(calculateSkillMatch(skills, text)).toBe(100)
  })
})
