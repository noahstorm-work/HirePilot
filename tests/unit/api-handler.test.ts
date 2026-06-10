import { describe, it, expect, beforeEach } from "vitest"
import { z } from "zod"
import { checkRateLimit, validateBody } from "@/lib/api-handler"

describe("checkRateLimit", () => {
  beforeEach(() => {
    // Reset by using a unique key per test
  })

  it("allows first request", () => {
    const result = checkRateLimit("test-rl-1", 3, 60_000)
    expect(result).toBeNull()
  })

  it("blocks after max requests exceeded", () => {
    const key = "test-rl-2"
    checkRateLimit(key, 2, 60_000)
    checkRateLimit(key, 2, 60_000)
    const blocked = checkRateLimit(key, 2, 60_000)
    expect(blocked).not.toBeNull()
    expect(blocked?.status).toBe(429)
  })

  it("resets after window expires", async () => {
    const key = "test-rl-3"
    checkRateLimit(key, 1, 1) // 1ms window
    await new Promise((r) => setTimeout(r, 5))
    const result = checkRateLimit(key, 1, 1)
    expect(result).toBeNull()
  })
})

describe("validateBody", () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().positive(),
  })

  it("returns parsed data on valid input", () => {
    const result = validateBody(schema, { name: "Alice", age: 30 })
    expect(result.error).toBeNull()
    expect(result.data).toEqual({ name: "Alice", age: 30 })
  })

  it("returns error on invalid input", () => {
    const result = validateBody(schema, { name: "", age: -1 })
    expect(result.error).not.toBeNull()
    expect(result.data).toBeNull()
  })

  it("returns error on missing fields", () => {
    const result = validateBody(schema, {})
    expect(result.error).not.toBeNull()
  })
})
