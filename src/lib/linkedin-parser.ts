export interface LinkedInData {
  about?: string
  headline?: string
  rawText?: string
}

export function formatLinkedInForAI(data: LinkedInData): string {
  const parts: string[] = []
  if (data.headline) parts.push(`Headline: ${data.headline}`)
  if (data.about) parts.push(`About: ${data.about}`)
  if (data.rawText) parts.push(`Full Profile Text:\n${data.rawText}`)
  return parts.join("\n\n")
}
