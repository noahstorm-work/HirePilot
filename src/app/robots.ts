import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/applications/", "/discover", "/profile"],
      },
    ],
    sitemap: "https://hirepilot-app.vercel.app/sitemap.xml",
  }
}
