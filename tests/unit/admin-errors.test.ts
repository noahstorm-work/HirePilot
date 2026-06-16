import { describe, it, expect } from "vitest"

interface PaginationParams {
  page: number
  limit: number
  offset: number
}

function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const rawPage = parseInt(searchParams.get("page") || "1")
  const rawLimit = parseInt(searchParams.get("limit") || "50")
  const page = Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage)
  const limit = Number.isNaN(rawLimit) ? 50 : Math.min(100, Math.max(1, rawLimit))
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

describe("admin errors pagination", () => {
  it("uses defaults when no params provided", () => {
    const params = parsePagination(new URLSearchParams(""))
    expect(params.page).toBe(1)
    expect(params.limit).toBe(50)
    expect(params.offset).toBe(0)
  })

  it("parses page number correctly", () => {
    const params = parsePagination(new URLSearchParams("page=3"))
    expect(params.page).toBe(3)
    expect(params.offset).toBe(100)
  })

  it("clamps page to minimum of 1", () => {
    const params = parsePagination(new URLSearchParams("page=0"))
    expect(params.page).toBe(1)
    const paramsNegative = parsePagination(new URLSearchParams("page=-5"))
    expect(paramsNegative.page).toBe(1)
  })

  it("parses limit correctly", () => {
    const params = parsePagination(new URLSearchParams("limit=25"))
    expect(params.limit).toBe(25)
    expect(params.offset).toBe(0)
  })

  it("clamps limit between 1 and 100", () => {
    const paramsZero = parsePagination(new URLSearchParams("limit=0"))
    expect(paramsZero.limit).toBe(1)

    const paramsOver = parsePagination(new URLSearchParams("limit=200"))
    expect(paramsOver.limit).toBe(100)

    const paramsNegative = parsePagination(new URLSearchParams("limit=-10"))
    expect(paramsNegative.limit).toBe(1)
  })

  it("computes offset correctly for various pages", () => {
    expect(parsePagination(new URLSearchParams("page=1&limit=50")).offset).toBe(0)
    expect(parsePagination(new URLSearchParams("page=2&limit=50")).offset).toBe(50)
    expect(parsePagination(new URLSearchParams("page=3&limit=25")).offset).toBe(50)
    expect(parsePagination(new URLSearchParams("page=10&limit=10")).offset).toBe(90)
  })

  it("handles non-numeric page gracefully", () => {
    const params = parsePagination(new URLSearchParams("page=abc&limit=xyz"))
    expect(params.page).toBe(1)
    expect(params.limit).toBe(50)
  })
})

interface FilterParams {
  level: string | null
  search: string | null
}

function parseFilters(searchParams: URLSearchParams): FilterParams {
  return {
    level: searchParams.get("level"),
    search: searchParams.get("search"),
  }
}

describe("admin errors filtering", () => {
  it("returns null filters when no params provided", () => {
    const filters = parseFilters(new URLSearchParams(""))
    expect(filters.level).toBeNull()
    expect(filters.search).toBeNull()
  })

  it("parses level filter", () => {
    const filters = parseFilters(new URLSearchParams("level=error"))
    expect(filters.level).toBe("error")
  })

  it("parses search filter", () => {
    const filters = parseFilters(new URLSearchParams("search=timeout"))
    expect(filters.search).toBe("timeout")
  })

  it("parses both level and search together", () => {
    const filters = parseFilters(new URLSearchParams("level=warn&search=database"))
    expect(filters.level).toBe("warn")
    expect(filters.search).toBe("database")
  })
})
