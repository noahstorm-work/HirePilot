# HirePilot

"Your AI Career Operating System." Next.js 15 App Router monolith with Supabase and OpenAI.

## Stack

| Concern       | Choice                                    |
|---------------|-------------------------------------------|
| Frontend      | Next.js 15 App Router + TailwindCSS v4    |
| Backend       | Next.js API routes only (no separate svc) |
| Database      | Supabase PostgreSQL                       |
| Auth          | Supabase Auth (email/password)            |
| AI            | OpenAI gpt-4o-mini, JSON mode, temp 0.3  |
| Job APIs      | Adzuna API (MVP)                          |
| Deployment    | Vercel                                    |

## Structure

```
src/
  app/
    (auth)/                   # Public routes (no AuthGuard)
      login/page.tsx
      register/page.tsx
      auth/callback/route.ts
    (dashboard)/              # All authenticated pages (AuthGuard wraps)
      layout.tsx              # AuthGuard wrapper
      dashboard/page.tsx       # Career Health Dashboard (server component, fetches analysis)
      discover/page.tsx       # Job Discovery (client component, search + save)
      applications/page.tsx   # Kanban pipeline (server component, groups by status)
      applications/[id]/page.tsx  # Application Workspace (analysis + rejection + followup)
      interview-prep/[id]/page.tsx # Interview Coach (client component, AI questions)
      profile/page.tsx        # CV + profile management
    api/
      ai/
        career-analysis/      # Full "Why No Interviews" (10 scores + plan)
        analyze-job/          # Match score + strengths + gaps per job
        cv-improve/           # Targeted CV rewrite for a specific job
        interview-coach/      # Technical + behavioral questions + STAR
        rejection-analysis/   # Rejection diagnosis + improvement plan
        generate-followup/    # Follow-up email generator
      jobs/
        search/               # Adzuna API proxy
        paste-url/            # Ingest job from any URL
      applications/
        create/               # Create application
        list/                 # List user's applications
        [id]/                 # GET/PATCH/DELETE single application + ai_results + rejection
        [id]/status/          # Quick status change (Kanban)
    layout.tsx                # Root layout (Inter font, no ThemeProvider)
    page.tsx                  # Redirects to /login
    globals.css               # Tailwind v4 base styles
  components/
    ui/                       # shadcn-style primitives
      badge.tsx, button.tsx, card.tsx, dialog.tsx, input.tsx, label.tsx, select.tsx, skeleton.tsx, tabs.tsx, textarea.tsx
    dashboard/
      ScoreCard.tsx           # Circular progress with score
      ScoreOverview.tsx       # 8-score grid
      ReadinessJourney.tsx    # Current→Target progress bar
      TopImprovements.tsx     # Ranked improvements with impact
      ThirtyDayPlan.tsx       # 4-week plan cards
      SkillsGapList.tsx       # Gaps + keywords + technologies
    discover/
      JobSearchBar.tsx        # Search input + location
      JobResultCard.tsx       # Result with save button
      PasteUrlDialog.tsx      # URL ingestion dialog
    applications/
      KanbanBoard.tsx         # 5-column Kanban with cards
      ApplicationWorkspace.tsx  # Full workspace (analysis, cover, followup, rejection)
    interview/
      InterviewCoach.tsx      # Questions, STAR, company prep
    profile/
      CvUploader.tsx          # CV text paste
      ProfileForm.tsx         # Personal info + links
      CvHistoryList.tsx       # Version history with metrics
    Navbar.tsx                # Sticky nav with all links + sign out
    AuthGuard.tsx             # Session check + redirect
  lib/
    supabase/
      client.ts, server.ts, middleware.ts
    openai.ts                 # OpenAI client instance
    ai-service.ts             # All AI call functions (analyzeCareer, analyzeJobMatch, etc.)
    prompts.ts                # All 6 system prompts with JSON schemas
    jobs-api.ts               # Adzuna API adapter
    utils.ts                  # cn() utility
  types/index.ts              # All TypeScript interfaces (16 types)

supabase/migrations/          # 13 SQL files for all tables
```

## Key Commands

```bash
npm run dev      # dev server (localhost:3000)
npm run build    # production build
npm run lint     # ESLint
```

## Dev Setup

1. Copy `.env.example` to `.env.local`, fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `ADZUNA_APP_ID` + `ADZUNA_API_KEY`
2. Run all SQL files from `supabase/migrations/` in Supabase SQL editor (001 through 013)
3. `npm run dev`
4. Create account at `/register`

## Database (10 tables, RLS-enabled)

- `user_profiles` — CV text, LinkedIn/GitHub/portfolio URLs, target role, experience (1:1 with auth.users)
- `applications` — company, role, job_url, status (Saved/Applied/Interview/Offer/Rejected), match_score, cv_version_id, salary, location, remote_type, source, notes
- `cv_versions` — CV text, version label (v1, v2...), interview_count, offer_count, application_count
- `jobs` — Normalized job store (deduplicated by external_id + source)
- `saved_jobs` — Per-user saved job listings (from search or paste)
- `career_analyses` — One per user: 8 scores, skills gaps, keywords, top improvements, 30-day plan
- `ai_results` — One per application: match_score, strengths, missing_skills, cv_suggestions, cover_letter, follow_up_email, interview_questions
- `rejection_analyses` — One per rejected app: likely_reasons, skills_gaps, cv_weaknesses, improvement_plan
- `weekly_reports` — One per user per week: trends, recommendations

## API Pattern

All routes return `{ success: boolean, data: T | null, error: string | null }`.
Input validated with Zod. Auth required (401).

## Core AI Features

| Feature | Endpoint | Prompt | Temp |
|---------|----------|--------|------|
| Career Analysis | POST /api/ai/career-analysis | CAREER_ANALYSIS_PROMPT | 0.3 |
| Job Match | POST /api/ai/analyze-job | JOB_ANALYZE_PROMPT | 0.3 |
| CV Improve | POST /api/ai/cv-improve | CV_IMPROVE_PROMPT | 0.3 |
| Interview Coach | POST /api/ai/interview-coach | INTERVIEW_COACH_PROMPT | 0.4 |
| Rejection Analysis | POST /api/ai/rejection-analysis | REJECTION_ANALYSIS_PROMPT | 0.3 |
| Follow-up Email | POST /api/ai/generate-followup | GENERATE_FOLLOWUP_PROMPT | 0.4 |

## AI Rules

- **One AI call per feature** — single prompt → JSON response. No chains, no agents.
- **JSON mode enabled** on all calls. Temperature 0.3–0.4.
- **Every AI output stored** in its respective DB table.
- **Prompts in `src/lib/prompts.ts`** — each with system persona + strict JSON output schema.
- **Error recovery**: JSON parse failure → retry at temp 0. Zod failure → log + null return.

## User Flow

1. Signup → redirected to `/profile`
2. Fill profile + paste CV → save
3. Go to `/dashboard` → see onboarding CTA if no analysis exists
4. Run Career Analysis → see Interview Readiness Score + all scores + 30-day plan
5. Go to `/discover` → search jobs or paste URL
6. Save job → it appears in Saved Jobs sidebar
7. Move to Applications → creates application at `/applications` Kanban
8. Click application → workspace with AI analysis, cover letter, follow-up
9. If Interview → go to `/interview-prep/[id]` for coach
10. If Rejected → workspace shows rejection analysis with improvement plan
11. Iterate CV at `/profile` → new CV version → re-run analysis

## Design

Linear/Notion-style SaaS: whitespace, soft shadows, rounded-2xl, violet accent (#7c3aed), clean card UI. No clutter.

## License

MIT (Copyright 2026 noahstorm-work)
