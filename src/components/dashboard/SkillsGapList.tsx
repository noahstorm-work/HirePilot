"use client"

import { Badge } from "@/components/ui/badge"
import type { SkillsGap } from "@/types"

interface Props {
  gaps: SkillsGap[]
  keywords: string[]
  technologies: string[]
  experienceAreas: string[]
}

const severityColors: Record<string, "destructive" | "warning" | "primary"> = {
  high: "destructive",
  medium: "warning",
  low: "primary",
}

export function SkillsGapList({ gaps, keywords, technologies, experienceAreas }: Props) {
  return (
    <div className="space-y-4">
      {gaps.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-[#63636e] uppercase tracking-wider mb-2">Skills Gap Analysis</h4>
          <div className="space-y-2">
            {gaps.map((gap, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Badge variant={severityColors[gap.severity] ?? "primary"} className="shrink-0">
                  {gap.severity}
                </Badge>
                <div>
                  <span className="font-medium text-[#fafafa]">{gap.area}</span>
                  <p className="text-xs text-[#63636e]">{gap.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {keywords.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-[#63636e] uppercase tracking-wider mb-2">Missing Keywords</h4>
          <div className="flex flex-wrap gap-1.5">
            {keywords.map((k, i) => (
              <Badge key={i} variant="destructive">{k}</Badge>
            ))}
          </div>
        </div>
      )}

      {technologies.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-[#63636e] uppercase tracking-wider mb-2">Missing Technologies</h4>
          <div className="flex flex-wrap gap-1.5">
            {technologies.map((t, i) => (
              <Badge key={i} variant="destructive">{t}</Badge>
            ))}
          </div>
        </div>
      )}

      {experienceAreas.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-[#63636e] uppercase tracking-wider mb-2">Missing Experience Areas</h4>
          <div className="flex flex-wrap gap-1.5">
            {experienceAreas.map((e, i) => (
              <Badge key={i} variant="warning">{e}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
