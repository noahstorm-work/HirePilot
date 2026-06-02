"use client"

import { ScoreCard } from "./ScoreCard"
import type { CareerAnalysis } from "@/types"

interface Props {
  analysis: CareerAnalysis
}

export function ScoreOverview({ analysis }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <ScoreCard label="Interview Readiness" score={analysis.interview_readiness_score} size="lg" />
      <ScoreCard label="CV Score" score={analysis.cv_score} />
      <ScoreCard label="LinkedIn Score" score={analysis.linkedin_score} />
      <ScoreCard label="GitHub Score" score={analysis.github_score} />
      <ScoreCard label="Portfolio Score" score={analysis.portfolio_score} />
      <ScoreCard label="Market Competitiveness" score={analysis.market_competitiveness_score} />
      <ScoreCard label="Recruiter Appeal" score={analysis.recruiter_appeal_score} />
      <ScoreCard label="Interview Probability" score={analysis.interview_probability} />
    </div>
  )
}
