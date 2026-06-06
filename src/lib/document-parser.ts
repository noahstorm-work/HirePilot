import * as mammoth from "mammoth"

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

export async function parseDocument(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase()

  if (ext === "pdf") return parsePDF(file)
  if (ext === "docx" || ext === "doc") return parseDOCX(file)
  if (ext === "txt") return parseTXT(file)

  throw new Error(`Unsupported file type: .${ext}. Please upload a PDF, Word, or text file.`)
}
