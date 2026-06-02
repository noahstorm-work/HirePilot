"use client"

interface Props {
  currentScore: number
  targetScore: number
}

export function ReadinessJourney({ currentScore, targetScore }: Props) {
  const gap = targetScore - currentScore
  const percentage = (currentScore / targetScore) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Current: <strong>{currentScore}</strong></span>
        <span className="text-gray-500">Target: <strong>{targetScore}</strong></span>
      </div>
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-700"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">
        {gap > 0 ? `${gap} points to reach your target` : "Target reached!"}
      </p>
    </div>
  )
}
