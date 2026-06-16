# HirePilot

Your AI Career Operating System. A Next.js 16 App Router monolith with Supabase and Groq AI.

## Tech Stack

| Concern       | Choice                                         |
|---------------|------------------------------------------------|
| Frontend      | Next.js 16 App Router + TailwindCSS v4         |
| Backend       | Next.js API routes                              |
| Database      | Supabase PostgreSQL                            |
| Auth          | Supabase Auth (email/password)                 |
| AI            | Groq Llama 3.3-70b-versatile, JSON mode        |
| Job APIs      | Adzuna + Jooble + JSearch V2 (RapidAPI)        |
| Locations     | Photon/Komoot (free, no API key)               |
| Rich Text     | TipTap editor                                  |
| Emails        | Resend (transactional)                         |
| Deployment    | Vercel                                         |

## Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/your-username/HirePilot.git
cd HirePilot
npm install
```

2. Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

3. Run all SQL migration files from `supabase/migrations/` in the Supabase SQL editor (001 through 020).

4. Start the dev server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin operations) |
| `OPENAI_API_KEY` | Groq API key (OpenAI-compatible) |
| `ADZUNA_APP_ID` | Adzuna job API app ID |
| `ADZUNA_API_KEY` | Adzuna job API key |
| `JSEARCH_API_KEY` | JSearch V2 API key (RapidAPI) |
| `JOOBLE_API_KEY` | Jooble job API key |
| `RESEND_API_KEY` | Resend API key (transactional email) |
| `EMAIL_FROM` | Sender address (e.g. `HirePilot <apply@yourdomain.com>`) |
| `NEXT_PUBLIC_SITE_URL` | App URL (default: `http://localhost:3000`) |
| `NEXT_PUBLIC_DEMO_EMAIL` | Demo account email (optional) |
| `NEXT_PUBLIC_DEMO_PASSWORD` | Demo account password (optional) |

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests (Vitest)
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run E2E tests (Playwright)
```

## API Overview

All API routes are under `/api` and return `{ success, data, error }`. See [`docs/api.md`](docs/api.md) for full documentation.

| Category | Endpoints |
|----------|-----------|
| AI | career-analysis, analyze-job, cv-improve, interview-coach, rejection-analysis, generate-followup, weekly-reports |
| Applications | create, list, [id], status, apply-email |
| Jobs | search, paste-url |
| Account | export, change-password, delete, update-metadata |
| Utility | error-log, feedback, locations/search, autocomplete |
| Admin | errors, auth/demo-credentials |

## Project Structure

```
src/
  app/
    (auth)/           # Login, register, forgot-password
    (dashboard)/      # All authenticated pages
      dashboard/      # Career health dashboard + AI tools
      discover/       # Job search and discovery
      applications/   # Kanban pipeline + workspace
      profile/        # CV + profile management
    api/              # All API routes
  components/ui/      # Reusable UI primitives
  lib/                # Utilities, AI service, job adapters, Supabase
  types/              # TypeScript interfaces
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m 'feat: add feature'`)
4. Push to the branch (`git push origin feat/my-feature`)
5. Open a Pull Request

Follow existing code patterns and design tokens. All PRs must pass lint and typecheck.

## License

MIT (Copyright 2026 noahstorm-work)
