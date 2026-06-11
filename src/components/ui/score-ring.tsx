"use client"

import { useEffect, useRef, useMemo } from "react"

interface ScoreRingProps {
  score: number
  maxScore?: number
  size?: "sm" | "md" | "lg" | "xl"
  label?: string
  showValue?: boolean
  className?: string
  animated?: boolean
}

const sizeMap = {
  sm: { width: 64, stroke: 5, fontSize: "text-lg", labelSize: "text-[9px]" },
  md: { width: 88, stroke: 6, fontSize: "text-2xl", labelSize: "text-[10px]" },
  lg: { width: 120, stroke: 7, fontSize: "text-3xl", labelSize: "text-xs" },
  xl: { width: 160, stroke: 8, fontSize: "text-4xl", labelSize: "text-xs" },
}

function getColor(score: number) {
  if (score >= 80) return { stroke: "#10b981", glow: "rgba(16, 185, 129, 0.15)" }
  if (score >= 60) return { stroke: "#f59e0b", glow: "rgba(245, 158, 11, 0.15)" }
  return { stroke: "#f43f5e", glow: "rgba(244, 63, 94, 0.15)" }
}

export function ScoreRing({
  score,
  maxScore = 100,
  size = "md",
  label,
  showValue = true,
  className = "",
  animated = true,
}: ScoreRingProps) {
  const { width, stroke, fontSize, labelSize } = sizeMap[size]
  const { radius, circumference, dashoffset, color } = useMemo(() => {
    const radius = (width - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const percentage = Math.min((score / maxScore) * 100, 100)
    const dashoffset = circumference - (percentage / 100) * circumference
    const color = getColor(score)
    return { radius, circumference, dashoffset, color }
  }, [score, maxScore, width, stroke])
  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (animated && circleRef.current) {
      circleRef.current.style.strokeDashoffset = `${circumference}`
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (circleRef.current) {
            circleRef.current.style.strokeDashoffset = `${dashoffset}`
          }
        })
      })
    }
  }, [score, circumference, dashoffset, animated])

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg
        width={width}
        height={width}
        viewBox={`0 0 ${width} ${width}`}
        className="-rotate-90"
      >
        {/* Background track */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke="var(--color-border-subtle)"
          strokeWidth={stroke}
          fill="none"
        />
        {/* Score arc */}
        <circle
          ref={circleRef}
          cx={width / 2}
          cy={width / 2}
          r={radius}
          stroke={color.stroke}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animated ? circumference : dashoffset}
          style={{
            transition: animated ? "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
            filter: `drop-shadow(0 0 6px ${color.glow})`,
          }}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold font-[family-name:var(--font-display)] ${fontSize}`}>
            {score}
          </span>
          {label && (
            <span className={`${labelSize} text-[var(--color-text-muted)] mt-0.5`}>{label}</span>
          )}
        </div>
      )}
    </div>
  )
}
