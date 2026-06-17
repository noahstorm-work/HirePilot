export interface CoverLetterTemplate {
  id: string
  name: string
  description: string
  promptModifier: string
}

export const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Formal, traditional tone suitable for corporate roles",
    promptModifier: "Write in a formal, professional tone. Use structured paragraphs and traditional business letter format.",
  },
  {
    id: "conversational",
    name: "Conversational",
    description: "Friendly, approachable tone for startups and modern companies",
    promptModifier: "Write in a warm, conversational tone. Show personality while remaining professional. Use shorter paragraphs.",
  },
  {
    id: "technical",
    name: "Technical",
    description: "Focus on technical skills and project details for engineering roles",
    promptModifier: "Emphasize technical skills, specific technologies, and project contributions. Be precise and data-driven.",
  },
]
