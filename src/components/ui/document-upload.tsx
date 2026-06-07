"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Loader2, X } from "lucide-react"
import { parseDocument, type ExtractedMetadata } from "@/lib/document-parser"
import { toast } from "sonner"

interface DocumentUploadProps {
  onTextExtracted: (text: string, metadata?: ExtractedMetadata) => void
  className?: string
  label?: string
}

export function DocumentUpload({ onTextExtracted, className, label = "Upload Document" }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [parsing, setParsing] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setParsing(true)
    setFileName(file.name)
    try {
      const { text, metadata } = await parseDocument(file)
      if (!text.trim()) {
        toast.error("No text found in document. The file may be image-based or empty.")
        setParsing(false)
        setFileName(null)
        return
      }
      onTextExtracted(text, metadata)
      toast.success(`Extracted text from ${file.name}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to parse document"
      toast.error(message)
      setFileName(null)
    } finally {
      setParsing(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (inputRef.current) inputRef.current.value = ""
  }

  const clearFile = () => {
    setFileName(null)
    setParsing(false)
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt"
        onChange={handleChange}
        className="hidden"
      />

      {fileName ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]">
          <FileText className="h-3.5 w-3.5 text-[var(--color-accent-violet)] shrink-0" />
          <span className="text-xs text-[var(--color-text-secondary)] truncate flex-1">{fileName}</span>
          {parsing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-text-muted)] shrink-0" />
          ) : (
            <button onClick={clearFile} aria-label="Remove file" className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-rose)] transition-colors shrink-0">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={parsing}
          className="border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs"
        >
          {parsing ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5 mr-1.5" />
          )}
          {label}
        </Button>
      )}
    </div>
  )
}
