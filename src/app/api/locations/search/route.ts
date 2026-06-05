import { NextRequest } from "next/server"
import { apiSuccess, apiError, authenticate } from "@/lib/api-handler"

interface PhotonFeature {
  geometry: { coordinates: [number, number] }
  properties: {
    name?: string
    city?: string
    state?: string
    country?: string
    countrycode?: string
    postcode?: string
    osm_value?: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticate()
    if (!user) return apiError("Unauthorized", 401)

    const q = request.nextUrl.searchParams.get("q")
    if (!q || q.trim().length < 2) {
      return apiSuccess([])
    }

    const params = new URLSearchParams({
      q: q.trim(),
      limit: "6",
      lang: "en",
    })

    // Filter to cities/towns only
    params.append("osm_tag", "place:city")
    params.append("osm_tag", "place:town")

    const res = await fetch(`https://photon.komoot.io/api?${params}`, {
      headers: { "Accept": "application/json" },
    })

    if (!res.ok) {
      return apiError("Location service unavailable", 502)
    }

    const data = await res.json()

    const suggestions = (data.features || []).map((f: PhotonFeature) => {
      const p = f.properties
      const parts = [p.city || p.name, p.state, p.country].filter(Boolean)
      return {
        label: parts.join(", "),
        city: p.city || p.name || "",
        state: p.state || "",
        country: p.country || "",
        countryCode: p.countrycode || "",
      }
    })

    return apiSuccess(suggestions)
  } catch (err) {
    return apiError("Internal server error", 500)
  }
}
