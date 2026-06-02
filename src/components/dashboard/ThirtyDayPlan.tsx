"use client"

import type { WeeklyPlan } from "@/types"

interface Props {
  plan: WeeklyPlan[]
}

export function ThirtyDayPlan({ plan }: Props) {
  return (
    <div className="space-y-4">
      {plan.map((week) => (
        <div key={week.week} className="p-4 rounded-xl bg-white border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">Week {week.week}</span>
            <span className="text-xs text-violet-600 font-medium">Target: {week.expected_score}</span>
          </div>
          <ul className="space-y-1.5">
            {week.actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
