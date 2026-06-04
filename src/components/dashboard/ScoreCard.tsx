"use client"

interface Props {
  label: string
  score: number | null
  maxScore?: number
  size?: "sm" | "lg"
}

export function ScoreCard({ label, score, maxScore = 100, size = "sm" }: Props) {
  if (score === null) return null

  const percentage = (score / maxScore) * 100
  const getColor = (s: number) => {
    if (s >= 80) return "text-emerald-400 stroke-emerald-400"
    if (s >= 60) return "text-amber-400 stroke-amber-400"
    return "text-rose-400 stroke-rose-400"
  }

  const radius = size === "lg" ? 54 : 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  const strokeWidth = size === "lg" ? 8 : 6

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2} className="-rotate-90">
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="#1e1e24"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-700 ${getColor(score)}`}
          />
        </svg>
        <span className={`absolute font-bold font-[family-name:var(--font-display)] ${size === "lg" ? "text-3xl" : "text-lg"}`}>
          {score}
        </span>
      </div>
      <span className="text-xs text-[#63636e] text-center leading-tight">{label}</span>
    </div>
  )
}
