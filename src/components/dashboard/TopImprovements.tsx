"use client"

import type { Improvement } from "@/types"

interface Props {
  improvements: Improvement[]
}

const difficultyColors: Record<string, string> = {
  easy: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  hard: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
}

export function TopImprovements({ improvements }: Props) {
  return (
    <div className="space-y-3">
      {improvements.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#16161a] border border-[#1e1e24]">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-xs text-violet-400 font-medium">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#fafafa]">{item.action}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-medium text-violet-400">{item.impact}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${difficultyColors[item.difficulty] ?? "bg-[#16161a] text-[#63636e]"}`}>
                {item.difficulty}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
