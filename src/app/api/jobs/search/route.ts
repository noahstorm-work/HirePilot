import { withAuth, apiSuccess, apiError } from "@/lib/api-handler"
import { searchAdzuna } from "@/lib/jobs-api"
import { z } from "zod"

const schema = z.object({
  query: z.string().min(1),
  location: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
})

export const GET = withAuth(async (request, { supabase, user }) => {
  const { searchParams } = new URL(request.url)
  const parsed = schema.safeParse({
    query: searchParams.get("query"),
    location: searchParams.get("location") || undefined,
    page: searchParams.get("page") ?? 1,
  })
  if (!parsed.success) return apiError(parsed.error.errors[0].message, 400)

  const { results, total } = await searchAdzuna(parsed.data.query, parsed.data.location, parsed.data.page)

  return apiSuccess({ results, total, page: parsed.data.page, per_page: 20 })
})
