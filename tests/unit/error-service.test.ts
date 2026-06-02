import { describe, it, expect, vi } from "vitest"
import { ErrorService } from "@/lib/error-service"

describe("ErrorService", () => {
  // Mock the fetch API for testing
  const mockFetch = vi.fn()

  beforeEach(() => {
    // @ts-ignore - mocking global fetch
    global.fetch = mockFetch
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }))
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it("should log an error via fetch", async () => {
    const testError = new Error("Test error message")
    const context = { test: "context" }

    await ErrorService.logError(testError, context)

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/error-log",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("Test error message")
      })
    )
  })

  it("should log a warning via fetch", async () => {
    const testMessage = "Test warning message"
    const context = { test: "context" }

    await ErrorService.logWarning(testMessage, context)

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/error-log",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("Test warning message")
      })
    )
  })

  it("should log info via fetch", async () => {
    const testMessage = "Test info message"
    const context = { test: "context" }

    await ErrorService.logInfo(testMessage, context)

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/error-log",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("Test info message")
      })
    )
  })
})