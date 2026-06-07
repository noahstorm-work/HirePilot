import { getLLM, AI_MODEL } from "./llm-client"
import type { SkillsGap, Improvement, WeeklyPlan } from "@/types"
import {
  CAREER_ANALYSIS_PROMPT,
  JOB_ANALYZE_PROMPT,
  CV_IMPROVE_PROMPT,
  INTERVIEW_COACH_PROMPT,
  REJECTION_ANALYSIS_PROMPT,
  GENERATE_FOLLOWUP_PROMPT,
  WEEKLY_REPORT_PROMPT,
} from "./prompts"

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim()
}

async function callAI<T>(systemPrompt: string, userContent: string, temperature = 0.3, maxRetries = 2): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const completion = await getLLM().chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        temperature: attempt > 0 ? Math.min(temperature + 0.1 * attempt, 0.7) : temperature,
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error("No AI response")
      }

      return JSON.parse(content) as T
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error("AI call failed after retries")
}

interface BaseAIInput {
  cvText: string
  yearsExperience?: number
  skills?: string[]
  fullName?: string
}

interface CareerAnalysisInput extends BaseAIInput {
  linkedinData?: string
  githubUrl?: string
  githubData?: string
  portfolioUrl?: string
  targetRole: string
  targetSeniority?: string
}

interface JobAnalyzeInput extends BaseAIInput {
  jobDescription: string
  targetRole?: string
}

interface CvImproveInput extends BaseAIInput {
  jobDescription: string
  targetRole?: string
}

interface InterviewCoachInput extends BaseAIInput {
  jobDescription: string
  company?: string
}

interface RejectionAnalysisInput extends BaseAIInput {
  jobDescription: string
  rejectionStage?: string
}

interface FollowupInput {
  company: string
  roleTitle: string
  daysSince: number
}

interface WeeklyReportInput {
  targetRole: string
  analysisSummary: string
  applicationsCount: number
  interviewRate: number
  topImprovements: string
}

export async function analyzeCareer(input: CareerAnalysisInput) {
  const cleanedCv = stripHtml(input.cvText)
  const userContentParts = [
    `CV:\n${cleanedCv}`,
    input.linkedinData ? `LinkedIn:\n${input.linkedinData}` : null,
    input.githubData ? input.githubData : input.githubUrl ? `GitHub URL: ${input.githubUrl}` : null,
    input.portfolioUrl ? `Portfolio URL: ${input.portfolioUrl}` : null,
    `Target Role: ${input.targetRole}`,
    input.targetSeniority ? `Target Seniority: ${input.targetSeniority}` : null,
    input.yearsExperience !== undefined ? `Years of Experience: ${input.yearsExperience}` : null,
    input.fullName ? `Candidate Name: ${input.fullName}` : null,
  ]

  if (input.skills && input.skills.length > 0) {
    userContentParts.push(`Stated Skills: ${input.skills.join(", ")}`)
  }

  const userContent = userContentParts.filter(Boolean).join("\n\n")
  return callAI<CareerAnalysisResult>(CAREER_ANALYSIS_PROMPT, userContent, 0.3)
}

export async function analyzeJobMatch(input: JobAnalyzeInput) {
  const parts = [
    `JOB DESCRIPTION:\n${input.jobDescription}`,
    `CV:\n${stripHtml(input.cvText)}`,
    input.targetRole ? `Target Role: ${input.targetRole}` : null,
    input.yearsExperience !== undefined ? `Years of Experience: ${input.yearsExperience}` : null,
  ]
  if (input.skills && input.skills.length > 0) {
    parts.push(`Stated Skills: ${input.skills.join(", ")}`)
  }
  return callAI<JobAnalyzeResult>(JOB_ANALYZE_PROMPT, parts.filter(Boolean).join("\n\n"), 0.3)
}

export async function improveCV(input: CvImproveInput) {
  const parts = [
    `JOB DESCRIPTION:\n${input.jobDescription}`,
    `CV:\n${stripHtml(input.cvText)}`,
    input.targetRole ? `Target Role: ${input.targetRole}` : null,
    input.yearsExperience !== undefined ? `Years of Experience: ${input.yearsExperience}` : null,
  ]
  if (input.skills && input.skills.length > 0) {
    parts.push(`Stated Skills: ${input.skills.join(", ")}`)
  }
  return callAI<CvImproveResult>(CV_IMPROVE_PROMPT, parts.filter(Boolean).join("\n\n"), 0.3)
}

export async function generateInterviewPrep(input: InterviewCoachInput) {
  const parts = [
    `JOB DESCRIPTION:\n${input.jobDescription}`,
    `CV:\n${stripHtml(input.cvText)}`,
    input.yearsExperience !== undefined ? `Years of Experience: ${input.yearsExperience}` : null,
    input.company ? `Company: ${input.company}` : null,
  ]
  return callAI<InterviewCoachResult>(INTERVIEW_COACH_PROMPT, parts.filter(Boolean).join("\n\n"), 0.4)
}

export async function analyzeRejection(input: RejectionAnalysisInput) {
  const parts = [
    `JOB DESCRIPTION:\n${input.jobDescription}`,
    `CV:\n${stripHtml(input.cvText)}`,
    input.rejectionStage ? `Rejection Stage: ${input.rejectionStage}` : null,
    input.yearsExperience !== undefined ? `Years of Experience: ${input.yearsExperience}` : null,
  ]
  if (input.skills && input.skills.length > 0) {
    parts.push(`Stated Skills: ${input.skills.join(", ")}`)
  }
  return callAI<RejectionAnalysisResult>(REJECTION_ANALYSIS_PROMPT, parts.filter(Boolean).join("\n\n"), 0.3)
}

export async function generateFollowup(input: FollowupInput) {
  const userContent = `Company: ${input.company}\nRole: ${input.roleTitle}\nDays since applying: ${input.daysSince}`
  return callAI<FollowupResult>(GENERATE_FOLLOWUP_PROMPT, userContent, 0.4)
}

interface WeeklyReportResult {
  skills_in_demand: string[]
  market_trends: string[]
  salary_ranges: { min: number; max: number; currency: string } | null
  user_weaknesses: string[]
  recommendations: string[]
}

export async function generateWeeklyReport(input: WeeklyReportInput) {
  const userContent = [
    `Target Role: ${input.targetRole}`,
    `Analysis Summary: ${input.analysisSummary}`,
    `Total Applications: ${input.applicationsCount}`,
    `Interview Rate: ${input.interviewRate}%`,
    `Top Areas for Improvement: ${input.topImprovements}`,
  ].join("\n\n")
  return callAI<WeeklyReportResult>(WEEKLY_REPORT_PROMPT, userContent, 0.3)
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
