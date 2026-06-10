import { withAuth, apiSuccess, apiError, checkRateLimit } from "@/lib/api-handler"
import { searchJobs } from "@/lib/jobs"
import { z } from "zod"
import type { JobSource } from "@/lib/jobs"

const schema = z.object({
  query: z.string().min(1),
  location: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  sources: z.string().optional(),
})

export const GET = withAuth(async (request) => {
  const url = new URL(request.url)
  const rl = checkRateLimit(`search:${user.id}`, 20, 60_000)
  if (rl) return rl
  const { searchParams } = url
  const parsed = schema.safeParse({
    query: searchParams.get("query"),
    location: searchParams.get("location") || undefined,
    page: searchParams.get("page") ?? 1,
    sources: searchParams.get("sources") || undefined,
  })
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 400)

  const sources = parsed.data.sources
    ? (parsed.data.sources.split(",").filter(Boolean) as JobSource[])
    : undefined

  const { results, total, sourceCounts } = await searchJobs({
    query: parsed.data.query,
    location: parsed.data.location,
    page: parsed.data.page,
    sources,
  })

  return apiSuccess({ results, total, page: parsed.data.page, per_page: 20, sourceCounts })
})
