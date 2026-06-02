// Seed demo account with realistic data
// Usage: node scripts/seed-demo.mjs

const SUPABASE_URL = "https://flxjjeldmhghqhfojqoa.supabase.co"
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZseGpqZWxkbWhnaHFoZm9qcW9hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM4NjExNiwiZXhwIjoyMDk1OTYyMTE2fQ.7A5HxZSo7Y0-2i-47MxFnRLYx1MBy1oaSHevzoyZINk"
const DEMO_EMAIL = "demo@hirepilot.app"
const DEMO_PASSWORD = "Demo123456!"
const DEMO_NAME = "Alex Rivera"

async function api(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  })
  const text = await res.text()
  if (!res.ok) {
    try { const j = JSON.parse(text); if (j.error_code === "email_exists" || j.message?.includes("already exists")) throw new Error("duplicate_email") } catch (e) { if (e.message === "duplicate_email") throw e }
    if (res.status === 409) throw new Error("duplicate")
    if (res.status === 404) { try { return JSON.parse(text) } catch { return null } }
    console.error(`API error ${res.status}:`, text)
    throw new Error(`API error ${res.status}`)
  }
  try { return JSON.parse(text) } catch { return text }
}

async function main() {
  const authHeaders = { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` }
  const rpcHeaders = { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, Prefer: "return=representation" }
  const base = (path) => `${SUPABASE_URL}/rest/v1/${path}`

  // 1. Create demo auth user
  console.log("Creating demo auth user...")
  let userId
  try {
    const user = await api(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD, email_confirm: true }),
    })
    userId = user.id
    console.log(`  Created user: ${userId}`)
  } catch (e) {
    if (e.message === "duplicate_email") {
      const users = await api(`${SUPABASE_URL}/auth/v1/admin/users?filter%5Bemail%5D=eq.${encodeURIComponent(DEMO_EMAIL)}`, { headers: authHeaders })
      userId = users?.users?.[0]?.id
      if (!userId) throw new Error("Could not find demo user")
      console.log(`  Found existing user: ${userId}`)
    } else {
      throw e
    }
  }

  // 2. Clean up existing demo data (applications CASCADE to ai_results + rejection_analyses)
  console.log("Cleaning existing demo data...")
  for (const table of ["applications", "saved_jobs", "career_analyses", "cv_versions"]) {
    try { await api(base(`${table}?user_id=eq.${userId}`), { method: "DELETE", headers: authHeaders }) } catch {}
  }
  try { await api(base(`user_profiles?id=eq.${userId}`), { method: "DELETE", headers: authHeaders }) } catch {}

  // 3. Seed user profile
  console.log("Seeding user profile...")
  await api(base("user_profiles"), {
    method: "POST", headers: rpcHeaders,
    body: JSON.stringify({
      id: userId, full_name: DEMO_NAME,
      target_role: "Senior Full-Stack Engineer", target_seniority: "senior", years_experience: 6,
      linkedin_url: "https://linkedin.com/in/alexrivera", github_url: "https://github.com/alexrivera", portfolio_url: "https://alexrivera.dev",
      skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS", "Docker", "GraphQL", "Python", "Tailwind CSS", "Next.js"],
      cv_text: `Alex Rivera — Senior Full-Stack Engineer | 6 years

PROFESSIONAL SUMMARY
Results-driven full-stack engineer with 6 years of experience building scalable web applications. Proficient in React, TypeScript, Node.js, and cloud infrastructure. Passionate about developer experience and clean architecture.

EXPERIENCE

TechCorp Inc. — Full-Stack Engineer (2021–Present)
- Led migration of monolithic Rails app to microservices using Node.js and Docker
- Built real-time dashboard serving 50k+ daily active users using React, GraphQL, and WebSockets
- Reduced API response times by 40% through query optimization and caching
- Mentored 3 junior engineers through code reviews and pair programming

StartupXYZ — Frontend Developer (2019–2021)
- Developed React component library used across 4 product teams
- Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes
- Increased test coverage from 30% to 85% using Jest and Cypress

WebAgency — Junior Developer (2018–2019)
- Built 12+ client websites using React, Vue.js, and WordPress
- Optimized page load times achieving 90+ Lighthouse scores

EDUCATION
B.S. Computer Science — State University (2014–2018)

SKILLS
React, TypeScript, JavaScript, Node.js, Python, PostgreSQL, MongoDB, GraphQL, REST APIs, AWS (EC2, S3, Lambda), Docker, Kubernetes, CI/CD, Git, Tailwind CSS, Next.js, Jest, Cypress`,
    }),
  })

  // 4. Seed CV version
  console.log("Seeding CV version...")
  await api(base("cv_versions"), {
    method: "POST", headers: rpcHeaders,
    body: JSON.stringify({ user_id: userId, version_label: "v1", cv_text: "Alex Rivera - Senior Full-Stack Engineer.", interview_count: 0, offer_count: 0, application_count: 0 }),
  })

  // 5. Seed career analysis
  console.log("Seeding career analysis...")
  await api(base("career_analyses"), {
    method: "POST", headers: rpcHeaders,
    body: JSON.stringify({
      user_id: userId,
      interview_readiness_score: 62, cv_score: 58, linkedin_score: 45, github_score: 50, portfolio_score: null,
      market_competitiveness_score: 55, recruiter_appeal_score: 60, interview_probability: 48, target_score: 78,
      skills_gap_analysis: [
        { area: "System Design", severity: "high", detail: "No mention of distributed systems experience" },
        { area: "Cloud Architecture", severity: "medium", detail: "AWS experience is basic, missing advanced services" },
        { area: "Leadership", severity: "medium", detail: "Limited team leadership experience beyond mentoring" },
        { area: "Testing Strategy", severity: "low", detail: "Good testing foundation but missing E2E patterns" },
      ],
      missing_keywords: ["Kubernetes", "Microservices", "System Design", "Distributed Systems", "Event-Driven Architecture"],
      missing_technologies: ["Redis", "Kafka", "Terraform", "GitHub Actions", "Prisma"],
      missing_experience_areas: ["Team Lead", "Architecture Decision Records", "Performance Budgeting"],
      top_improvements: [
        { action: "Add system design and architecture experience to CV", impact: "+12 points", difficulty: "hard" },
        { action: "Improve LinkedIn profile with recommendations and portfolio", impact: "+10 points", difficulty: "easy" },
        { action: "Build and showcase a full-stack open source project", impact: "+8 points", difficulty: "medium" },
      ],
      thirty_day_plan: [
        { week: 1, actions: ["Rewrite CV summary to highlight architecture experience", "Update LinkedIn headline and about section", "Ask 2 colleagues for LinkedIn recommendations"], expected_score: 65 },
        { week: 2, actions: ["Complete AWS Solutions Architect study plan", "Start open source project with microservices pattern", "Add 3 project case studies to portfolio"], expected_score: 70 },
        { week: 3, actions: ["Practice system design interviews (2x/week)", "Contribute to 2 open source projects", "Write technical blog post on architecture"], expected_score: 74 },
        { week: 4, actions: ["Apply to 10 target companies", "Attend 2 networking events", "Complete cloud certification practice exam"], expected_score: 78 },
      ],
    }),
  })

  // 6. Seed applications
  console.log("Seeding applications...")
  async function createApp(data) {
    const [row] = await api(base("applications"), { method: "POST", headers: rpcHeaders, body: JSON.stringify(data) })
    return row
  }

  const saved = await createApp({ user_id: userId, company: "Stripe", role_title: "Senior Frontend Engineer", status: "Saved", salary_range: "$180k - $220k", location: "San Francisco, CA", remote_type: "Hybrid", created_at: "2026-05-28T10:00:00Z", updated_at: "2026-05-28T10:00:00Z", job_url: "https://stripe.com/jobs/senior-frontend-engineer", job_description: "Build and maintain Stripe's payment UI components." })
  const applied = await createApp({ user_id: userId, company: "Vercel", role_title: "Software Engineer, Developer Experience", status: "Applied", match_score: 72, salary_range: "$160k - $200k", location: "Remote", remote_type: "Remote", created_at: "2026-05-20T09:00:00Z", updated_at: "2026-05-20T09:00:00Z", job_url: "https://vercel.com/careers/developer-experience", job_description: "Improve developer experience for Vercel platform. Next.js, CLI, SDKs." })
  const interview = await createApp({ user_id: userId, company: "Linear", role_title: "Full-Stack Engineer", status: "Interview", match_score: 85, salary_range: "$170k - $210k", location: "San Francisco, CA", remote_type: "Remote", created_at: "2026-05-15T08:00:00Z", updated_at: "2026-05-25T14:00:00Z", job_url: "https://linear.app/jobs/fullstack-engineer", job_description: "Build the future of issue tracking. React, TypeScript, GraphQL, PostgreSQL." })
  const rejected = await createApp({ user_id: userId, company: "Datadog", role_title: "Senior Software Engineer - Frontend Platform", status: "Rejected", match_score: 55, salary_range: "$190k - $230k", location: "New York, NY", remote_type: "Hybrid", created_at: "2026-05-01T07:00:00Z", updated_at: "2026-05-18T11:00:00Z", job_url: "https://datadog.com/jobs/senior-frontend-platform", job_description: "Build frontend platform for monitoring dashboard. React, TypeScript, WebAssembly." })
  const offer = await createApp({ user_id: userId, company: "Railway", role_title: "Platform Engineer", status: "Offer", match_score: 78, salary_range: "$150k - $190k", location: "Remote", remote_type: "Remote", created_at: "2026-04-10T06:00:00Z", updated_at: "2026-05-30T16:00:00Z", job_url: "https://railway.app/careers/platform-engineer", job_description: "Build platform that makes deployment effortless. Go, TypeScript, Kubernetes, distributed systems." })

  // 7. Seed AI results
  console.log("Seeding AI results...")
  await api(base("ai_results"), {
    method: "POST", headers: rpcHeaders,
    body: JSON.stringify({ application_id: applied.id, match_score: 72, strengths: ["Strong React and TypeScript background", "Experience with developer tooling", "CI/CD pipeline expertise"], missing_skills: ["CLI tooling experience", "Go programming language", "Documentation architecture"], cv_suggestions: ["Highlight open source contributions", "Add CLI tool projects", "Quantify DX impact metrics"], cover_letter: `Dear Vercel Team,\n\nI've been an admirer of Vercel's developer-first approach since using Next.js in 2020. Your Developer Experience role perfectly aligns with my passion for creating tools that make other developers more productive.\n\nAt TechCorp, I led the migration of a monolithic app to microservices, cutting API response times by 40%. I'd love to bring this experience to Vercel.\n\nBest,\nAlex Rivera` }),
  })
  await api(base("ai_results"), {
    method: "POST", headers: rpcHeaders,
    body: JSON.stringify({ application_id: interview.id, match_score: 85, strengths: ["Full-stack TypeScript expertise", "GraphQL production experience", "Performance optimization skills"], missing_skills: ["Issue tracking domain knowledge", "Real-time collaboration features"], cv_suggestions: ["Showcase GraphQL schema design experience", "Add real-time feature examples", "Demonstrate product thinking"], follow_up_email: `Subject: Follow-up on Full-Stack Engineer Application\n\nHi Linear Team,\n\nI wanted to follow up on my application. Since applying, I've built a small project using Linear's API to understand the platform better. Looking forward to the next steps!\n\nBest,\nAlex Rivera`, interview_questions: { technical: ["Design a real-time collaborative document editing system", "How would you optimize a GraphQL query that's N+1 problematic?", "Explain React's reconciliation algorithm and how you'd debug a rendering performance issue"], behavioral: ["Tell me about a time you disagreed with a technical decision", "Describe a project where you had to learn a new technology quickly", "How do you approach mentoring junior engineers?"] }, company_insights: "Linear has ~100 employees, values high agency and written communication. Remote-first with strong async culture." }),
  })
  await api(base("ai_results"), {
    method: "POST", headers: rpcHeaders,
    body: JSON.stringify({ application_id: offer.id, match_score: 78, strengths: ["Docker and containerization experience", "AWS infrastructure knowledge", "Node.js and TypeScript expertise"], missing_skills: ["Go programming", "Advanced Kubernetes", "Distributed systems patterns"], cv_suggestions: ["Quantify infrastructure migration impact", "Add Docker Compose and K8s experience details", "Show troubleshooting/incident response examples"], interview_questions: { technical: ["How would you design a multi-region deployment strategy?", "Explain how container networking works at the OS level", "Design a service mesh for a microservices architecture"], behavioral: ["Describe a time you handled a production incident", "How do you prioritize technical debt vs new features?"] } }),
  })

  // 8. Seed rejection analysis
  console.log("Seeding rejection analysis...")
  await api(base("rejection_analyses"), {
    method: "POST", headers: rpcHeaders,
    body: JSON.stringify({ application_id: rejected.id, user_id: userId, likely_reasons: ["Missing WebAssembly experience (key requirement)", "Competition from candidates with platform team experience", "CV didn't highlight system-level programming skills"], skills_gaps: ["WebAssembly / WASM", "Rust or lower-level systems programming", "Large-scale performance profiling"], cv_weaknesses: ["No mention of platform engineering work", "Frontend-heavy emphasis without platform context", "Missing performance optimization case studies"], market_competition_note: "Datadog's Frontend Platform team is highly sought-after. Most candidates have prior platform engineering experience at companies like Google, Meta, or Microsoft.", improvement_plan: [{ action: "Build a small WebAssembly project and add to portfolio", priority: "high" }, { action: "Learn Rust fundamentals through practical projects", priority: "high" }, { action: "Reframe current role experience as platform engineering work", priority: "medium" }, { action: "Add performance optimization metrics to CV", priority: "medium" }] }),
  })

  // 9. Seed saved jobs
  console.log("Seeding saved jobs...")
  await api(base("saved_jobs"), { method: "POST", headers: rpcHeaders, body: JSON.stringify({ user_id: userId, external_id: "adzuna-001", company: "Anthropic", role_title: "Frontend Engineer, Developer Experience", job_url: "https://anthropic.com/careers/frontend-dx", description: "Build developer-facing tools and SDKs for Claude API. React, TypeScript.", salary: "$200k - $280k", location: "San Francisco, CA", source: "adzuna", ai_match_score: 80 }) })
  await api(base("saved_jobs"), { method: "POST", headers: rpcHeaders, body: JSON.stringify({ user_id: userId, external_id: "adzuna-002", company: "Clerk", role_title: "Senior Software Engineer", job_url: "https://clerk.com/careers/senior-software-engineer", description: "Build authentication infrastructure used by millions of developers. React, TypeScript, Next.js.", salary: "$170k - $210k", location: "Remote", source: "adzuna", ai_match_score: 88 }) })

  console.log("\n✅ Demo account seeded successfully!")
  console.log(`   Email:    ${DEMO_EMAIL}`)
  console.log(`   Password: ${DEMO_PASSWORD}`)
}

main().catch(console.error)
