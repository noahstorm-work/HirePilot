import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hirepilot-app.vercel.app"

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/dashboard`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/discover`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/applications`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/profile`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ]
}
