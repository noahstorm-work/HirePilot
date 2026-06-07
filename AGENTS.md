# HirePilot

"Your AI Career Operating System." Next.js 16 App Router monolith with Supabase and Groq AI.

## Stack

| Concern       | Choice                                         |
|---------------|------------------------------------------------|
| Frontend      | Next.js 16 App Router + TailwindCSS v4         |
| Backend       | Next.js API routes only (no separate svc)      |
| Database      | Supabase PostgreSQL                            |
| Auth          | Supabase Auth (email/password)                 |
| AI            | Groq Llama 3.3-70b-versatile, JSON mode, temp 0.3 |
| Job APIs      | Adzuna + Jooble + JSearch V2 (RapidAPI)        |
| Locations     | Photon/Komoot (free, no API key)               |
| Rich Text     | TipTap editor                                  |
| Emails        | Resend (transactional)                         |
| Toasts        | Sonner                                         |
| Deployment    | Vercel                                         |

## Structure

```
src/
  app/
    (auth)/                       # Public routes (no AuthGuard)
      login/page.tsx
      register/page.tsx
      forgot-password/page.tsx    # Password reset email
      auth/callback/route.ts
    (dashboard)/                  # All authenticated pages (AuthGuard wraps)
      layout.tsx                  # AuthGuard wrapper + skip nav
      dashboard/page.tsx          # Career Health Dashboard
      dashboard/career-analysis/  # Full career analysis with scores
      dashboard/interview-coach/  # Standalone AI interview coach
      dashboard/ats-checker/      # CV ATS compliance checker
      dashboard/skills-gap/       # Skills gap tracking with progress
      dashboard/cv-versions/      # CV version history
      dashboard/insights/         # Weekly reports + feedback
      discover/page.tsx           # Job Discovery (search + paste URL + save)
      applications/page.tsx       # Kanban pipeline + create dialog
      applications/[id]/page.tsx  # Application workspace (analysis + rejection + followup)
      interview-prep/[id]/page.tsx # Interview Coach (AI questions)
      profile/page.tsx            # CV + profile management + account settings
    api/
      ai/
        career-analysis/          # Full "Why No Interviews" (8 scores + plan)
        analyze-job/              # Match score + strengths + gaps per job
        cv-improve/               # Targeted CV rewrite for a specific job
        interview-coach/          # Technical + behavioral questions + STAR
        rejection-analysis/       # Rejection diagnosis + improvement plan
        generate-followup/        # Follow-up email generator
        weekly-reports/           # Weekly report generation
      jobs/
        search/                   # Multi-source job search (Adzuna + Jooble + JSearch)
        paste-url/                # Ingest job from any URL
      locations/
        search/                   # Photon/Komoot location autocomplete proxy
      autocomplete/
        companies/                # Company name suggestions from saved data
        roles/                    # Role title suggestions from apps + common roles
      applications/
        create/                   # Create application
        list/                     # List user's applications
        [id]/                     # GET/PATCH/DELETE single application + ai_results
        [id]/status/              # Quick status change (Kanban)
        apply-email/              # Send application email via Resend
      account/                    # DELETE account (uses service role)
      account/change-password/    # Change password
      account/export/             # Export all user data as JSON
      error-log/                  # Client-side error logging to Supabase
      feedback/                   # User feedback submission
    not-found.tsx                 # 404 page
    error.tsx                     # Global error boundary
    layout.tsx                    # Root layout (Syne + Satoshi fonts, Toaster)
    page.tsx                      # Landing page (redirects to /dashboard if logged in)
    globals.css                   # Tailwind v4 design system (50+ CSS tokens)
    sitemap.ts                    # SEO sitemap
    robots.ts                     # SEO robots.txt
  components/
    ui/                           # Reusable primitives (all use CSS variable tokens)
      badge.tsx, button.tsx, card.tsx, dialog.tsx, input.tsx, label.tsx,
      select.tsx, skeleton.tsx, tabs.tsx, textarea.tsx,
      score-ring.tsx              # Animated circular score with color coding
      metric-card.tsx             # Reusable metric display card
      section-header.tsx          # Section title + description + optional action
      empty-state.tsx             # Empty state with icon + CTA
      loading-screen.tsx          # Full-page loading spinner + LoadingSkeleton
      rich-text-editor.tsx        # TipTap WYSIWYG editor with toolbar (lazy-loaded)
      autocomplete-input.tsx      # Generic autocomplete base (debounce + keyboard nav)
      company-autocomplete.tsx    # Company name autocomplete wrapper
      role-autocomplete.tsx       # Role title autocomplete wrapper
      location-autocomplete.tsx   # Location autocomplete (Photon/Komoot)
      document-upload.tsx         # PDF/DOCX/TXT upload with metadata extraction
    discover/
      PasteUrlDialog.tsx          # URL ingestion dialog
    interview/
      InterviewCoach.tsx          # Questions, STAR, company prep
    Sidebar.tsx                   # 3-section nav (Core/AI Tools/Analytics), ⌘ shortcuts
    CommandPalette.tsx            # ⌘K search across all pages
    AuthGuard.tsx                 # Session check + redirect
  lib/
    supabase/
      client.ts, server.ts, middleware.ts
    llm-client.ts                 # Groq LLM client (Llama 3.3-70b-versatile)
    ai-service.ts                 # All AI functions (analyzeCareer, analyzeJobMatch, etc.)
    prompts.ts                    # All 7 system prompts with JSON schemas
    jobs/                         # Multi-source job search
      types.ts                    # JobSearchResult, JobSource, detectCurrency, formatSalary
      adzuna.ts                   # Adzuna adapter
      jooble.ts                   # Jooble adapter
      jsearch.ts                  # JSearch V2 adapter (RapidAPI)
      index.ts                    # Unified searchJobs() with deduplication
    api-handler.ts                # Shared API utilities (apiSuccess, apiError, withAuth, etc.)
    navigation.ts                 # Shared nav data (NAV_SECTIONS, ALL_NAV_ITEMS, ICON_MAP)
    constants.ts                  # APPLICATION_STATUSES, STATUS_COLORS
    trigger-analysis.ts           # Fire-and-forget AI analysis trigger
    github-api.ts                 # GitHub REST API integration (free, no auth)
    document-parser.ts            # Client-side PDF/DOCX/TXT parsing + metadata extraction
    error-service.ts              # Client-side error logging
    utils.ts                      # cn() utility
  types/index.ts                  # All TypeScript interfaces

supabase/migrations/              # 20 SQL files for all tables + RLS policies
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
   - `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
   - `OPENAI_API_KEY` (actually Groq API key)
   - `ADZUNA_APP_ID` + `ADZUNA_API_KEY`
   - `JSEARCH_API_KEY` (RapidAPI free tier)
   - `JOOBLE_API_KEY` (free from jooble.org)
   - `RESEND_API_KEY` (for email sending)
   - `EMAIL_FROM` (e.g. `HirePilot <apply@yourdomain.com>`)
   - `NEXT_PUBLIC_DEMO_EMAIL` + `NEXT_PUBLIC_DEMO_PASSWORD`
2. Run all SQL files from `supabase/migrations/` in Supabase SQL editor (001 through 020)
3. `npm run dev`
4. Create account at `/register` or use demo account

## Database (14 tables, RLS-enabled)

- `user_profiles` — CV text, LinkedIn/GitHub/portfolio URLs, target role, experience, full name, years of experience, seniority, skills (1:1 with auth.users)
- `applications` — company, role, job_url, status (Saved/Applied/Interview/Offer/Rejected), match_score, cv_version_id, salary, location, remote_type, source, application_source, notes
- `cv_versions` — CV text, version label (v1, v2...), interview_count, offer_count, application_count
- `jobs` — Normalized job store (deduplicated by external_id + source)
- `saved_jobs` — Per-user saved job listings (from search or paste)
- `career_analyses` — One per user: 8 scores, skills gaps, keywords, top improvements, 30-day plan, github_data
- `ai_results` — One per application: match_score, strengths, missing_skills, cv_suggestions, cover_letter, follow_up_email, interview_questions
- `rejection_analyses` — One per rejected app: likely_reasons, skills_gaps, cv_weaknesses, improvement_plan
- `weekly_reports` — One per user per week: skills_in_demand, market_trends, salary_ranges, recommendations
- `error_logs` — Client/server error logging with level, message, stack, user_id, url, metadata
- `feedback` — User feedback with message, rating, url, user_agent
- `skill_progress` — Per-skill tracking with status (identified/in_progress/completed), unique per user+skill
- `subscriptions` — User subscription tracking
- `locations` — Location data cache

## API Pattern

All routes return `{ success: boolean, data: T | null, error: string | null }`.
Input validated with Zod where applicable. Auth required (401).
Rate limiting via `checkRateLimit` on all AI routes (5 req/min) and feedback/error-log.
Shared utilities in `src/lib/api-handler.ts`: `apiSuccess`, `apiError`, `authenticate`, `requireAuth`, `validateBody`, `logServerError`, `withAuth`, `withAuthParams`, `checkRateLimit`.

## Core AI Features

| Feature | Endpoint | Prompt | Temp | Rate Limit |
|---------|----------|--------|------|------------|
| Career Analysis | POST /api/ai/career-analysis | CAREER_ANALYSIS_PROMPT | 0.3 | 5/min |
| Job Match | POST /api/ai/analyze-job | JOB_ANALYZE_PROMPT | 0.3 | 10/min |
| CV Improve | POST /api/ai/cv-improve | CV_IMPROVE_PROMPT | 0.3 | 5/min |
| Interview Coach | POST /api/ai/interview-coach | INTERVIEW_COACH_PROMPT | 0.4 | 10/min |
| Rejection Analysis | POST /api/ai/rejection-analysis | REJECTION_ANALYSIS_PROMPT | 0.3 | 5/min |
| Follow-up Email | POST /api/ai/generate-followup | GENERATE_FOLLOWUP_PROMPT | 0.4 | 10/min |
| Weekly Report | POST /api/ai/weekly-reports | WEEKLY_REPORT_PROMPT | 0.3 | 3/min |

## AI Rules

- **One AI call per feature** — single prompt → JSON response. No chains, no agents.
- **JSON mode enabled** on all calls. Temperature 0.3–0.4.
- **Every AI output stored** in its respective DB table.
- **Prompts in `src/lib/prompts.ts`** — each with system persona + strict JSON output schema.
- **Error recovery**: JSON parse failure → retry at temp 0. Zod failure → log + null return.
- **HTML stripping**: `stripHtml()` in `ai-service.ts` before sending to AI APIs.
- **Rate limiting**: All AI endpoints protected via `checkRateLimit()`.

## User Flow

1. Signup → redirected to `/profile`
2. Fill profile + paste CV (TipTap rich text) → save (auto-save)
3. Go to `/dashboard` → see onboarding CTA if no analysis exists
4. Run Career Analysis → see Interview Readiness Score + all scores + 30-day plan
5. Go to `/discover` → search jobs (with location autocomplete) or paste URL
6. Save job → it appears in Saved Jobs sidebar
7. Move to Applications → creates application via Kanban create dialog
8. Click application → workspace with AI analysis, cover letter, follow-up
9. If Interview → go to `/interview-prep/[id]` for coach
10. If Rejected → workspace shows rejection analysis with improvement plan
11. Track skills gap progress at `/dashboard/skills-gap`
12. View CV versions and restore at `/dashboard/cv-versions`
13. Iterate CV at `/profile` → new CV version → re-run analysis
14. Export data or manage account at `/profile` (Account section)

## Design

Linear/Notion-style SaaS: CSS custom property design system (50+ tokens), glass morphism, animations, violet accent (#7c3aed). Dark-first. Fonts: Syne (display) + Satoshi (body). All UI primitives use `var(--color-*)` tokens.

## Security

- All AI routes rate-limited (in-memory, per-user)
- CSRF protection via Supabase auth cookies
- Input validation with Zod on all API routes
- SSRF protection on paste-url route (blocks private IPs)
- Security headers: CSP, X-Frame-Options, HSTS, X-Content-Type-Options
- RLS policies on all database tables
- Error messages sanitized in production responses

## License

MIT (Copyright 2026 noahstorm-work)
