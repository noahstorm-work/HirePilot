"use client"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"

interface DataSectionProps {
  exporting: boolean
  handleExportData: () => void
}

export function DataSection({ exporting, handleExportData }: DataSectionProps) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-[11px] font-medium text-[var(--color-text-tertiary)] block">
            Export Your Data
          </Label>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            Download all your profile, applications, and AI results as JSON
          </p>
        </div>
        <Button
          onClick={handleExportData}
          disabled={exporting}
          variant="outline"
          size="sm"
          className="h-9 px-3 border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]"
        >
          {exporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
          ) : (
            <Download className="h-3.5 w-3.5 mr-1.5" />
          )}
          Export
        </Button>
      </div>
    </div>
  )
}