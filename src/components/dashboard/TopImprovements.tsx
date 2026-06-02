"use client"

import type { Improvement } from "@/types"

interface Props {
  improvements: Improvement[]
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  hard: "bg-red-100 text-red-700",
}

export function TopImprovements({ improvements }: Props) {
  return (
    <div className="space-y-3">
      {improvements.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-100">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs text-violet-600 font-medium">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{item.action}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-violet-600">{item.impact}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${difficultyColors[item.difficulty] ?? "bg-gray-100 text-gray-600"}`}>
                {item.difficulty}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
