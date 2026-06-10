import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { logError } from "@/lib/error-service"

describe("logError", () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    global.fetch = mockFetch
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it("sends error to /api/error-log", async () => {
    await logError("Test error message", "Error stack", "test-context")

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/error-log",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("Test error message"),
      })
    )
  })

  it("sends message without stack", async () => {
    await logError("Simple error")

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/error-log",
      expect.objectContaining({
        body: expect.stringContaining("Simple error"),
      })
    )
  })
})
