import { getLLM, AI_MODEL } from "./llm-client"
import type { SkillsGap, Improvement, WeeklyPlan } from "@/types"
import {
  CAREER_ANALYSIS_PROMPT,
  JOB_ANALYZE_PROMPT,
  CV_IMPROVE_PROMPT,
  INTERVIEW_COACH_PROMPT,
  REJECTION_ANALYSIS_PROMPT,
  GENERATE_FOLLOWUP_PROMPT,
} from "./prompts"

async function callAI<T>(systemPrompt: string, userContent: string, temperature = 0.3): Promise<T> {
  const completion = await getLLM().chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    response_format: { type: "json_object" },
    temperature,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error("No AI response")
  }

  return JSON.parse(content) as T
}

interface CareerAnalysisInput {
  cvText: string
  linkedinData?: string
  githubUrl?: string
  portfolioUrl?: string
  targetRole: string
  targetSeniority?: string
}

interface JobAnalyzeInput {
  jobDescription: string
  cvText: string
}

interface CvImproveInput {
  jobDescription: string
  cvText: string
  targetRole?: string
}

interface InterviewCoachInput {
  jobDescription: string
  cvText: string
}

interface RejectionAnalysisInput {
  jobDescription: string
  cvText: string
  rejectionStage?: string
}

interface FollowupInput {
  company: string
  roleTitle: string
  daysSince: number
}

export async function analyzeCareer(input: CareerAnalysisInput) {
  const userContent = [
    `CV:\n${input.cvText}`,
    input.linkedinData ? `LinkedIn:\n${input.linkedinData}` : null,
    input.githubUrl ? `GitHub URL: ${input.githubUrl}` : null,
    input.portfolioUrl ? `Portfolio URL: ${input.portfolioUrl}` : null,
    `Target Role: ${input.targetRole}`,
    input.targetSeniority ? `Target Seniority: ${input.targetSeniority}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")

  return callAI<CareerAnalysisResult>(CAREER_ANALYSIS_PROMPT, userContent, 0.3)
}

export async function analyzeJobMatch(input: JobAnalyzeInput) {
  const userContent = `JOB DESCRIPTION:\n${input.jobDescription}\n\nCV:\n${input.cvText}`
  return callAI<JobAnalyzeResult>(JOB_ANALYZE_PROMPT, userContent, 0.3)
}

export async function improveCV(input: CvImproveInput) {
  const userContent = [
    `JOB DESCRIPTION:\n${input.jobDescription}`,
    `CV:\n${input.cvText}`,
    input.targetRole ? `Target Role: ${input.targetRole}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")
  return callAI<CvImproveResult>(CV_IMPROVE_PROMPT, userContent, 0.3)
}

export async function generateInterviewPrep(input: InterviewCoachInput) {
  const userContent = `JOB DESCRIPTION:\n${input.jobDescription}\n\nCV:\n${input.cvText}`
  return callAI<InterviewCoachResult>(INTERVIEW_COACH_PROMPT, userContent, 0.4)
}

export async function analyzeRejection(input: RejectionAnalysisInput) {
  const userContent = [
    `JOB DESCRIPTION:\n${input.jobDescription}`,
    `CV:\n${input.cvText}`,
    input.rejectionStage ? `Rejection Stage: ${input.rejectionStage}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")
  return callAI<RejectionAnalysisResult>(REJECTION_ANALYSIS_PROMPT, userContent, 0.3)
}

export async function generateFollowup(input: FollowupInput) {
  const userContent = `Company: ${input.company}\nRole: ${input.roleTitle}\nDays since applying: ${input.daysSince}`
  return callAI<FollowupResult>(GENERATE_FOLLOWUP_PROMPT, userContent, 0.4)
}

export interface CareerAnalysisResult {
  interview_readiness_score: number
  cv_score: number
  linkedin_score: number | null
  github_score: number | null
  portfolio_score: number | null
  market_competitiveness_score: number
  recruiter_appeal_score: number
  interview_probability: number
  skills_gap_analysis: SkillsGap[]
  missing_keywords: string[]
  missing_technologies: string[]
  missing_experience_areas: string[]
  top_improvements: Improvement[]
  target_score: number
  thirty_day_plan: WeeklyPlan[]
}

export interface JobAnalyzeResult {
  match_score: number
  strengths: string[]
  missing_skills: string[]
  cv_suggestions: string[]
  cover_letter: string
  interview_probability: number
}

export interface CvImproveResult {
  improved_cv_sections: {
    summary: string
    experience: string[]
    skills: string[]
    achievements: string[]
  }
  keyword_additions: string[]
  sections_to_remove: string[]
  estimated_match_improvement: string
}

export interface InterviewCoachResult {
  technical_questions: Array<{
    question: string
    expected_areas: string[]
    sample_answer: string
  }>
  behavioral_questions: Array<{
    type: string
    question: string
    situation: string
    task: string
    action: string
    result: string
  }>
  company_preparation: {
    common_interview_format: string
    key_areas_to_review: string[]
    questions_to_ask: string[]
  }
}

export interface RejectionAnalysisResult {
  likely_reasons: string[]
  skills_gaps: string[]
  cv_weaknesses: string[]
  market_competition_note: string
  improvement_plan: Array<{
    action: string
    priority: "low" | "medium" | "high"
  }>
}

export interface FollowupResult {
  subject: string
  body: string
}
