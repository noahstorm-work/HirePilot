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
        <span className="text-[#63636e]">Current: <strong className="text-[#fafafa]">{currentScore}</strong></span>
        <span className="text-[#63636e]">Target: <strong className="text-[#fafafa]">{targetScore}</strong></span>
      </div>
      <div className="h-3 rounded-full bg-[#1e1e24] overflow-hidden">
        <div
          className="h-full rounded-full gradient-violet transition-all duration-700"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-[#45454e]">
        {gap > 0 ? `${gap} points to reach your target` : "Target reached!"}
      </p>
    </div>
  )
}
