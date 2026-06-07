export interface ExtractedMetadata {
  full_name?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  skills?: string[]
}

const SECTION_HEADERS = /^(?:Experience|Education|Work History|Employment|Projects|Certifications|Awards|References|Summary|Objective|Contact|About|Profile|Skills|Technical Skills|Technologies|Core Competencies|Key Skills|Professional Skills)\s*:?\s*$/im

const SKILLS_HEADERS = /^(?:Skills|Technical Skills|Technologies|Core Competencies|Key Skills|Professional Skills|Technical Competencies|Tech Stack)\s*:?\s*$/im

const NOISE_WORDS = /^(?:CV|Resume|Curriculum Vitae|Contact|Email|Phone|Address|LinkedIn|GitHub|Portfolio|Website|http|www|summary|objective|education|experience|skills|projects|certifications)$/i

export function extractMetadata(text: string): ExtractedMetadata {
  const meta: ExtractedMetadata = {}

  // LinkedIn URL
  const linkedinMatch = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_%]+\/?/i)
  if (linkedinMatch) meta.linkedin_url = linkedinMatch[0]

  // GitHub URL
  const githubMatch = text.match(/https?:\/\/(?:www\.)?github\.com\/[a-zA-Z0-9\-_]+\/?/i)
  if (githubMatch) meta.github_url = githubMatch[0]

  // Portfolio URL — all URLs minus known platforms
  const allUrls = text.match(/https?:\/\/[^\s]+/gi) || []
  const knownDomains = /linkedin\.com|github\.com|indeed\.com|glassdoor\.com|ziprecruiter\.com|google\.com|facebook\.com|twitter\.com|x\.com|instagram\.com|youtube\.com|stackoverflow\.com|dev\.to|medium\.com|behance\.net|dribbble\.com/i
  const portfolio = allUrls.find((u) => !knownDomains.test(u))
  if (portfolio) meta.portfolio_url = portfolio

  // Full name — first line that looks like a name
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
  for (const line of lines.slice(0, 5)) {
    if (NOISE_WORDS.test(line)) continue
    if (line.length > 60) continue
    if (/\d{3,}/.test(line)) continue
    if (/@|\.com|http/.test(line)) continue
    const words = line.split(/\s+/)
    if (words.length >= 2 && words.length <= 4 && words.every((w) => /^[A-Z]/.test(w))) {
      meta.full_name = line
      break
    }
  }

  // Skills — find skills section and extract items
  const skillSectionMatch = text.match(new RegExp(SKILLS_HEADERS.source + "[\\s\\S]*?(?=\\n\\s*[A-Z]|$)", "im"))
  if (skillSectionMatch) {
    const section = skillSectionMatch[0]
    const headerLine = section.split("\n")[0]
    const afterHeader = section.slice(headerLine.length)
    const items = afterHeader
      .split(/[,|\n•\-*]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 50 && !/^\d+$/.test(s) && !SECTION_HEADERS.test(s))
    if (items.length > 0) meta.skills = items.slice(0, 30)
  }

  return meta
}

export async function parsePDF(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist")
  pdfjsLib.GlobalWorkerOptions.workerSrc = ""

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, useSystemFonts: true }).promise

  const textParts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => (item as Record<string, unknown>).str ?? "")
      .join(" ")
    if (pageText.trim()) textParts.push(pageText.trim())
  }

  return textParts.join("\n\n")
}

export async function parseDOCX(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const mammoth = await import("mammoth")
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

export async function parseTXT(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("Failed to read text file"))
    reader.readAsText(file)
  })
}

export async function parseDocument(file: File): Promise<{ text: string; metadata: ExtractedMetadata }> {
  const ext = file.name.split(".").pop()?.toLowerCase()

  let text = ""
  if (ext === "pdf") text = await parsePDF(file)
  else if (ext === "docx" || ext === "doc") text = await parseDOCX(file)
  else if (ext === "txt") text = await parseTXT(file)
  else throw new Error(`Unsupported file type: .${ext}. Please upload a PDF, Word, or text file.`)

  const metadata = extractMetadata(text)
  return { text, metadata }
}
