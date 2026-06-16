# HirePilot API Documentation

## Authentication

All API routes (except demo-credentials) require a valid Supabase JWT session. Include the session cookie from Supabase Auth in requests. Unauthenticated requests receive:

```json
{ "success": false, "data": null, "error": "Unauthorized" }
```

## Rate Limiting

All endpoints are rate-limited per-user with an in-memory sliding window (60-second window). When exceeded, returns HTTP 429:

```json
{ "success": false, "data": null, "error": "Rate limit exceeded. Try again in Xs." }
```

| Category | Default Limit |
|----------|--------------|
| AI endpoints | 3–10 req/min |
| Application endpoints | 20–60 req/min |
| Job endpoints | 10–20 req/min |
| Account endpoints | 1–10 req/min |
| Utility endpoints | 30 req/min |

## Response Format

All endpoints return `{ success: boolean, data: T | null, error: string | null }`.

---

## AI Endpoints

### POST `/api/ai/career-analysis`

Full career analysis with 8 scores, skills gaps, and 30-day plan.

**Rate limit:** 5 req/min

**Request body:**
```json
{
  "cv_text": "string (required, min 10 chars)",
  "linkedin_url": "string (optional)",
  "linkedin_about": "string (optional)",
  "github_url": "string (optional)",
  "portfolio_url": "string (optional)",
  "target_role": "string (optional, default: Software Engineer)",
  "target_seniority": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "interview_readiness_score": 75,
    "cv_score": 82,
    "linkedin_score": 60,
    "github_score": 70,
    "portfolio_score": 55,
    "market_competitiveness_score": 68,
    "recruiter_appeal_score": 72,
    "interview_probability": "65%",
    "skills_gap_analysis": "...",
    "missing_keywords": ["..."],
    "missing_technologies": ["..."],
    "missing_experience_areas": ["..."],
    "top_improvements": [{ "action": "...", "impact": 8 }],
    "target_score": 85,
    "thirty_day_plan": ["..."],
    "github_data": "...",
    "created_at": "ISO date"
  },
  "error": null
}
```

---

### POST `/api/ai/analyze-job`

Analyze match score, strengths, gaps, and generate cover letter for a specific job.

**Rate limit:** 10 req/min

**Request body:**
```json
{
  "applicationId": "uuid (optional)",
  "jobDescription": "string (optional)",
  "job_url": "string (optional)",
  "cvText": "string (optional, falls back to profile CV)",
  "company": "string (optional)",
  "role": "string (optional)",
  "template": "string (optional, cover letter template ID)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "match_score": 78,
    "strengths": ["..."],
    "missing_skills": ["..."],
    "cv_suggestions": ["..."],
    "cover_letter": "string"
  },
  "error": null
}
```

---

### POST `/api/ai/cv-improve`

Targeted CV rewrite for a specific job description.

**Rate limit:** 5 req/min

**Request body:**
```json
{
  "cvText": "string (required)",
  "jobDescription": "string (optional)",
  "targetRole": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "improved_cv": "string",
    "changes_made": ["..."]
  },
  "error": null
}
```

---

### POST `/api/ai/interview-coach`

Generate technical + behavioral interview questions with STAR method guidance.

**Rate limit:** 10 req/min

**Request body:**
```json
{
  "applicationId": "uuid (optional)",
  "jobDescription": "string (optional)",
  "cvText": "string (optional)",
  "role": "string (optional)",
  "company": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "technical_questions": [{ "question": "...", "answer": "...", "tips": "..." }],
    "behavioral_questions": [{ "question": "...", "star_example": { "situation": "...", "task": "...", "action": "...", "result": "..." } }],
    "company_research": "...",
    "questions_to_ask": ["..."]
  },
  "error": null
}
```

---

### POST `/api/ai/rejection-analysis`

Diagnose rejection reasons and generate improvement plan.

**Rate limit:** 5 req/min

**Request body:**
```json
{
  "applicationId": "uuid (required)",
  "jobDescription": "string (required, min 10 chars)",
  "cvText": "string (optional)",
  "company": "string (optional)",
  "rejectionStage": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "application_id": "uuid",
    "likely_reasons": ["..."],
    "skills_gaps": ["..."],
    "cv_weaknesses": ["..."],
    "market_competition_note": "...",
    "improvement_plan": ["..."],
    "created_at": "ISO date"
  },
  "error": null
}
```

---

### POST `/api/ai/generate-followup`

Generate a follow-up email for a pending application.

**Rate limit:** 10 req/min

**Request body:**
```json
{
  "applicationId": "uuid (required)",
  "company": "string (required)",
  "roleTitle": "string (required)",
  "daysSince": "number (required, min 0)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subject": "string",
    "body": "string"
  },
  "error": null
}
```

---

### POST `/api/ai/weekly-reports`

Generate weekly career report with market insights and recommendations.

**Rate limit:** 3 req/min

**Request body:** None (POST with empty body)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "week_start": "2026-01-01",
    "skills_in_demand": ["..."],
    "market_trends": ["..."],
    "salary_ranges": { "min": 80000, "max": 120000, "currency": "USD" },
    "user_weaknesses": ["..."],
    "recommendations": ["..."],
    "created_at": "ISO date"
  },
  "error": null
}
```

---

## Application Endpoints

### POST `/api/applications/create`

Create a new job application.

**Rate limit:** 20 req/min

**Request body:**
```json
{
  "company": "string (required, max 200)",
  "role_title": "string (required, max 200)",
  "job_url": "string (optional, valid URL)",
  "job_description": "string (optional)",
  "status": "Saved | Applied | Interview | Offer | Rejected (default: Saved)",
  "salary_range": "string (optional)",
  "location": "string (optional)",
  "remote_type": "string (optional)",
  "application_source": "string (optional)",
  "match_score": "number 0-100 (optional)",
  "cv_version_id": "uuid (optional)",
  "notes": "string (optional)"
}
```

**Response:** Returns the created application object.

---

### GET `/api/applications/list`

List all applications for the authenticated user.

**Rate limit:** 30 req/min

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "company": "string",
      "role_title": "string",
      "status": "Saved | Applied | Interview | Offer | Rejected",
      "match_score": 78,
      "created_at": "ISO date",
      "..."
    }
  ],
  "error": null
}
```

---

### GET `/api/applications/[id]`

Get a single application with AI results and rejection analysis.

**Rate limit:** 60 req/min

**Response:**
```json
{
  "success": true,
  "data": {
    "application": { "...application fields" },
    "analysis": { "...ai_results or null" },
    "rejectionAnalysis": { "...rejection_analyses or null" }
  },
  "error": null
}
```

---

### PATCH `/api/applications/[id]`

Update an application's fields.

**Rate limit:** 30 req/min

**Request body:** Same fields as create, all optional.

**Response:** Returns the updated application object.

---

### DELETE `/api/applications/[id]`

Delete an application.

**Rate limit:** 20 req/min

**Response:**
```json
{ "success": true, "data": null, "error": null }
```

---

### PATCH `/api/applications/[id]/status`

Quick status change (used by Kanban drag-and-drop).

**Rate limit:** 30 req/min

**Request body:**
```json
{ "status": "Saved | Applied | Interview | Offer | Rejected" }
```

**Response:** Returns the updated application object.

---

### POST `/api/applications/apply-email`

Send application email with CV attachment via Resend.

**Rate limit:** 5 req/min

**Request body:**
```json
{
  "application_id": "uuid (required)",
  "to_email": "string (required, valid email)",
  "company": "string (required)",
  "role_title": "string (required)"
}
```

**Response:**
```json
{ "success": true, "data": { "sent": true, "to": "email@example.com" }, "error": null }
```

---

## Job Endpoints

### GET `/api/jobs/search`

Search jobs across Adzuna, Jooble, and JSearch (RapidAPI).

**Rate limit:** 20 req/min

**Query params:**
- `query` (required) — search term
- `location` (optional) — location filter
- `page` (optional, default: 1) — page number
- `sources` (optional) — comma-separated source filter: `adzuna,jooble,jsearch`

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "string",
        "title": "string",
        "company": "string",
        "location": "string",
        "url": "string",
        "salary_min": 80000,
        "salary_max": 120000,
        "description": "string",
        "source": "adzuna | jooble | jsearch",
        "remote": false,
        "created_at": "ISO date"
      }
    ],
    "total": 150,
    "page": 1,
    "per_page": 20,
    "sourceCounts": { "adzuna": 50, "jooble": 60, "jsearch": 40 }
  },
  "error": null
}
```

---

### POST `/api/jobs/paste-url`

Ingest a job listing from any URL by scraping metadata.

**Rate limit:** 10 req/min

**Request body:**
```json
{
  "url": "string (required, valid URL)",
  "company": "string (optional, fallback)",
  "roleTitle": "string (optional, fallback)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://...",
    "company": "string | null",
    "role_title": "string",
    "description": "string | null"
  },
  "error": null
}
```

---

## Account Endpoints

### DELETE `/api/account`

Delete the authenticated user's account (uses Supabase service role).

**Rate limit:** 1 req/min

**Response:**
```json
{ "success": true, "data": { "deleted": true }, "error": null }
```

---

### POST `/api/account/change-password`

Change the authenticated user's password.

**Rate limit:** 3 req/min

**Request body:**
```json
{ "newPassword": "string (min 8 chars)" }
```

**Response:**
```json
{ "success": true, "data": { "updated": true }, "error": null }
```

---

### GET `/api/account/export`

Export all user data as JSON (profile, applications, AI results, reports, etc.).

**Rate limit:** 3 req/min

**Response:**
```json
{
  "success": true,
  "data": {
    "exported_at": "ISO date",
    "user_id": "uuid",
    "email": "string",
    "profile": { "..." },
    "applications": [{ "..." }],
    "ai_results": [{ "..." }],
    "career_analyses": [{ "..." }],
    "rejection_analyses": [{ "..." }],
    "weekly_reports": [{ "..." }],
    "saved_jobs": [{ "..." }],
    "cv_versions": [{ "..." }],
    "skill_progress": [{ "..." }]
  },
  "error": null
}
```

---

### POST `/api/account/update-metadata`

Update user metadata (e.g., email preferences).

**Rate limit:** 10 req/min

**Request body:**
```json
{ "weekly_email_optin": true }
```

**Response:**
```json
{ "success": true, "data": { "updated": true }, "error": null }
```

---

## Utility Endpoints

### POST `/api/error-log`

Log a client-side error to the database.

**Rate limit:** 30 req/min

**Request body:**
```json
{
  "level": "error | warn | info (required)",
  "message": "string (required, max 2000)",
  "stack": "string (optional, max 5000)",
  "url": "string (optional, max 2000)",
  "user_agent": "string (optional, max 500)",
  "metadata": "object (optional)"
}
```

**Response:**
```json
{ "success": true, "data": { "id": null }, "error": null }
```

---

### POST `/api/feedback`

Submit user feedback with rating.

**Rate limit:** 5 req/min

**Request body:**
```json
{
  "rating": "number 1-5 (required)",
  "message": "string (required, max 2000)"
}
```

**Response:** Returns the created feedback object.

---

### GET `/api/locations/search`

Search locations using Photon/Komoot geocoding API.

**Rate limit:** 30 req/min

**Query params:**
- `q` (required, min 2 chars) — location search query

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "label": "City, State, Country",
      "city": "string",
      "state": "string",
      "country": "string",
      "countryCode": "US"
    }
  ],
  "error": null
}
```

---

### GET `/api/autocomplete/companies`

Autocomplete company names from saved applications and jobs.

**Rate limit:** 30 req/min

**Query params:**
- `q` (optional) — search term (min 1 char)

**Response:**
```json
{ "success": true, "data": ["Google", "Meta", "..."], "error": null }
```

---

### GET `/api/autocomplete/roles`

Autocomplete role titles from applications and common roles.

**Rate limit:** 30 req/min

**Query params:**
- `q` (optional) — search term

**Response:**
```json
{ "success": true, "data": ["Software Engineer", "Senior Software Engineer", "..."], "error": null }
```

---

## Admin Endpoints

### GET `/api/admin/errors`

List error logs with pagination and filtering.

**Rate limit:** 30 req/min

**Query params:**
- `page` (optional, default: 1)
- `limit` (optional, default: 50, max: 100)
- `level` (optional) — filter by `error`, `warn`, or `info`
- `search` (optional) — search messages

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "level": "error",
        "message": "string",
        "stack": "string",
        "user_id": "uuid",
        "url": "string",
        "metadata": {},
        "created_at": "ISO date"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 50
  },
  "error": null
}
```

---

### GET `/api/auth/demo-credentials`

Get demo account credentials (for demo login).

**Rate limit:** 10 req/min

**Response:**
```json
{ "success": true, "data": { "email": "demo@hirepilot.app", "password": "Demo123456!" }, "error": null }
```

---

## Error Response Format

All errors follow the same structure:

```json
{
  "success": false,
  "data": null,
  "error": "Human-readable error message"
}
```

Common HTTP status codes:
- `400` — Validation error or bad request
- `401` — Unauthorized (missing or invalid session)
- `404` — Resource not found
- `429` — Rate limit exceeded
- `500` — Internal server error
