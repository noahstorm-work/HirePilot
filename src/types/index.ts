export type ApplicationStatus = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected"

export type SeniorityLevel = "junior" | "mid" | "senior" | "lead"

export interface UserProfile {
  id: string
  full_name: string | null
  target_role: string | null
  target_seniority: SeniorityLevel | null
  years_experience: number | null
  cv_text: string | null
  linkedin_url: string | null
  linkedin_data: Record<string, unknown> | null
  github_url: string | null
  portfolio_url: string | null
  skills: string[] | null
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  user_id: string
  company: string
  role_title: string
  job_url: string | null
  job_description: string | null
  status: ApplicationStatus
  salary_range: string | null
  location: string | null
  remote_type: string | null
  application_source: string | null
  match_score: number | null
  cv_version_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CvVersion {
  id: string
  user_id: string
  version_label: string
  cv_text: string
  created_at: string
  interview_count: number
  offer_count: number
  application_count: number
}

export interface CareerAnalysis {
  id: string
  user_id: string
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
  github_data?: string | null
  created_at: string
  updated_at: string
}

export interface SkillsGap {
  area?: string
  skill?: string
  name?: string
  severity?: "low" | "medium" | "high"
  detail?: string
  impact?: string
  [key: string]: unknown
}

export interface Improvement {
  action: string
  impact?: string
  points?: number
  difficulty?: "easy" | "medium" | "hard"
  priority?: string
  description?: string
  [key: string]: unknown
}

export interface WeeklyPlan {
  week?: number
  title?: string
  description?: string
  tasks?: string
  actions?: string[]
  expected_score?: number
  [key: string]: unknown
}

export interface AiResult {
  id: string
  application_id: string
  match_score: number
  strengths: string[]
  missing_skills: string[]
  cv_suggestions: string[]
  cover_letter: string | null
  follow_up_email: string | null
  interview_questions: InterviewQuestions | null
  company_insights: string | null
  created_at: string
  updated_at: string
}

export interface InterviewQuestions {
  technical_questions: Array<{ question: string; expected_areas?: string[]; sample_answer?: string; hint?: string }>
  behavioral_questions: Array<{ type: string; question: string; situation?: string; task?: string; action?: string; result?: string; framework?: string }>
  company_preparation?: {
    common_interview_format?: string
    key_areas_to_review?: string[]
    questions_to_ask?: string[]
  }
}

export interface ErrorLog {
  id: string
  timestamp: string
  level: "error" | "warn" | "info"
  message: string
  stack?: string
  user_id: string | null
  url?: string
  user_agent?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface Feedback {
  id: string
  user_id: string
  message: string
  rating: number | null
  page_url: string | null
  created_at: string
}

export interface SavedJob {
  id: string
  user_id: string
  external_id: string | null
  company: string
  role_title: string
  job_url: string
  description: string | null
  salary: string | null
  location: string | null
  source: string
  ai_match_score: number | null
  created_at: string
}

export interface Job {
  id: string
  external_id: string | null
  source: string | null
  company: string
  role_title: string
  description: string | null
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  location: string | null
  remote_type: string | null
  company_logo: string | null
  created_at: string
}

export interface RejectionAnalysis {
  id: string
  application_id: string
  user_id: string
  likely_reasons: string[]
  skills_gaps: string[]
  cv_weaknesses: string[]
  market_competition_note: string | null
  improvement_plan: RejectionImprovement[]
  created_at: string
}

export interface RejectionImprovement {
  action: string
  priority: "low" | "medium" | "high"
}

export interface WeeklyReport {
  id: string
  user_id: string
  week_start: string
  skills_in_demand: string[]
  market_trends: string[]
  salary_ranges: { min: number; max: number; currency: string } | null
  user_weaknesses: string[]
  recommendations: string[]
  created_at: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  error: string | null
}
