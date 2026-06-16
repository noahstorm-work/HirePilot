import { describe, it, expect, vi, beforeEach } from "vitest"
import { z } from "zod"

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}))

import {
  validateBody,
  checkRateLimit,
  apiSuccess,
  apiError,
  withAuth,
} from "@/lib/api-handler"
import { createClient } from "@/lib/supabase/server"

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

  it("returns error on invalid types", () => {
    const result = validateBody(schema, { name: 123, age: "not a number" })
    expect(result.error).not.toBeNull()
    expect(result.data).toBeNull()
  })

  it("returns error on empty object", () => {
    const result = validateBody(schema, {})
    expect(result.error).not.toBeNull()
    expect(result.data).toBeNull()
  })

  it("returns error on null input", () => {
    const result = validateBody(schema, null)
    expect(result.error).not.toBeNull()
    expect(result.data).toBeNull()
  })

  it("returns error on undefined input", () => {
    const result = validateBody(schema, undefined)
    expect(result.error).not.toBeNull()
    expect(result.data).toBeNull()
  })

  it("strips extra fields with strict schema", () => {
    const strict = z.object({ name: z.string() }).strict()
    const result = validateBody(strict, { name: "test", extra: true })
    expect(result.error).not.toBeNull()
  })

  it("allows optional fields to be missing", () => {
    const schema = z.object({
      name: z.string(),
      nickname: z.string().optional(),
    })
    const result = validateBody(schema, { name: "Alice" })
    expect(result.error).toBeNull()
    expect(result.data).toEqual({ name: "Alice" })
  })

  it("validates nested objects", () => {
    const schema = z.object({
      user: z.object({ name: z.string().min(1), email: z.string().email() }),
    })
    const valid = validateBody(schema, { user: { name: "A", email: "a@b.com" } })
    expect(valid.error).toBeNull()

    const invalid = validateBody(schema, { user: { name: "", email: "bad" } })
    expect(invalid.error).not.toBeNull()
  })

  it("validates arrays", () => {
    const schema = z.object({ tags: z.array(z.string()).min(1) })
    const valid = validateBody(schema, { tags: ["react", "ts"] })
    expect(valid.error).toBeNull()

    const empty = validateBody(schema, { tags: [] })
    expect(empty.error).not.toBeNull()
  })

  it("error message includes field path", async () => {
    const schema = z.object({ user: z.object({ name: z.string().min(1) }) })
    const result = validateBody(schema, { user: { name: "" } })
    expect(result.error).not.toBeNull()
    const body = JSON.parse(await (result.error as any).text())
    expect(body.error).toContain("user.name")
  })
})

describe("checkRateLimit", () => {
  it("allows first request", () => {
    expect(checkRateLimit("rl-new-1", 3, 60_000)).toBeNull()
  })

  it("blocks after max requests exceeded", () => {
    const key = "rl-block-1"
    checkRateLimit(key, 2, 60_000)
    checkRateLimit(key, 2, 60_000)
    const blocked = checkRateLimit(key, 2, 60_000)
    expect(blocked).not.toBeNull()
    expect(blocked?.status).toBe(429)
  })

  it("resets after window expires", async () => {
    const key = "rl-reset-1"
    checkRateLimit(key, 1, 1)
    await new Promise((r) => setTimeout(r, 5))
    expect(checkRateLimit(key, 1, 1)).toBeNull()
  })

  it("returns retry-after seconds in error body", async () => {
    const key = "rl-retry-1"
    checkRateLimit(key, 1, 1000)
    const result = checkRateLimit(key, 1, 1000)
    expect(result).not.toBeNull()
    const body = JSON.parse(await result!.text())
    expect(body.error).toContain("Try again in")
  })

  it("different keys are independent", () => {
    checkRateLimit("rl-a", 1, 60_000)
    checkRateLimit("rl-b", 1, 60_000)
    expect(checkRateLimit("rl-a", 1, 60_000)).not.toBeNull()
    expect(checkRateLimit("rl-b", 1, 60_000)).not.toBeNull()
    expect(checkRateLimit("rl-c", 1, 60_000)).toBeNull()
  })

  it("handles default parameters", () => {
    const key = "rl-default-1"
    for (let i = 0; i < 5; i++) checkRateLimit(key)
    const blocked = checkRateLimit(key)
    expect(blocked).not.toBeNull()
    expect(blocked?.status).toBe(429)
  })
})

describe("apiSuccess", () => {
  it("returns 200 with correct shape", async () => {
    const res = apiSuccess({ foo: "bar" })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ success: true, data: { foo: "bar" }, error: null })
  })

  it("handles null data", async () => {
    const res = apiSuccess(null)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toBeNull()
  })

  it("handles array data", async () => {
    const res = apiSuccess([1, 2, 3])
    const body = await res.json()
    expect(body.data).toEqual([1, 2, 3])
  })
})

describe("apiError", () => {
  it("returns default 500 status", async () => {
    const res = apiError("something broke")
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body).toEqual({ success: false, data: null, error: "something broke" })
  })

  it("returns custom status code", async () => {
    const res = apiError("not found", 404)
    expect(res.status).toBe(404)
  })

  it("returns 401 for unauthorized", async () => {
    const res = apiError("Unauthorized", 401)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.success).toBe(false)
  })

  it("returns 429 for rate limit", async () => {
    const res = apiError("Rate limit exceeded", 429)
    expect(res.status).toBe(429)
  })
})

describe("withAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns 401 when user is null", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as any)

    const handler = vi.fn()
    const wrapped = withAuth(handler)
    const req = new Request("http://localhost/api/test")
    const res = await wrapped(req)

    expect(res.status).toBe(401)
    expect(handler).not.toHaveBeenCalled()
  })

  it("calls handler with user and supabase when authenticated", async () => {
    const mockUser = { id: "user-1", email: "test@test.com" }
    const mockSupabase = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) } }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const handler = vi.fn().mockResolvedValue(apiSuccess({ ok: true }))
    const wrapped = withAuth(handler)
    const req = new Request("http://localhost/api/test")
    const res = await wrapped(req)

    expect(handler).toHaveBeenCalledWith(req, { supabase: mockSupabase, user: mockUser })
    expect(res.status).toBe(200)
  })

  it("returns 500 when handler throws", async () => {
    const mockUser = { id: "user-1" }
    const mockSupabase = { auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }) } }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const handler = vi.fn().mockRejectedValue(new Error("boom"))
    const wrapped = withAuth(handler)
    const req = new Request("http://localhost/api/test")
    const res = await wrapped(req)

    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe("Internal server error")
  })
})
