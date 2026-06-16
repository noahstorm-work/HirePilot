-- Performance indexes for HirePilot
-- NOTE: For large existing tables in production, consider using CREATE INDEX CONCURRENTLY
-- to avoid locking. This is not supported inside transactions, so run these manually
-- if the tables already have significant data.

-- applications: dashboard + Kanban filtered queries
-- (user_id, created_at DESC) covers listing all user apps sorted
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_created
  ON applications (user_id, created_at DESC);

-- (user_id, status) covers Kanban column filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_applications_user_status
  ON applications (user_id, status);

-- saved_jobs: discover sidebar, user's saved jobs sorted
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_saved_jobs_user_created
  ON saved_jobs (user_id, created_at DESC);

-- ai_results: lookup by application (FK not implicitly indexed)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_results_application_id
  ON ai_results (application_id);

-- career_analyses: dashboard/insights fetch latest per user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_career_analyses_user_created
  ON career_analyses (user_id, created_at DESC);

-- weekly_reports: lookup by user + specific week
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_weekly_reports_user_week
  ON weekly_reports (user_id, week_start);

-- error_logs: admin queries — sorted by date, filtered by level
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_created
  ON error_logs (created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_level_created
  ON error_logs (level, created_at DESC);

-- ILIKE on message is not efficiently indexable; a GIN trigram index would help
-- but requires pg_trgm extension. Uncomment if enabled:
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_error_logs_message_trgm
--   ON error_logs USING gin (message gin_trgm_ops);

-- skill_progress: skills gap page fetches all user skills
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_skill_progress_user
  ON skill_progress (user_id);

-- rejection_analyses: application detail lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rejection_analyses_application_id
  ON rejection_analyses (application_id);

-- Also index user_id FK on rejection_analyses (used in broader queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rejection_analyses_user_id
  ON rejection_analyses (user_id);

-- feedback: admin/export queries by user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_user_created
  ON feedback (user_id, created_at DESC);
