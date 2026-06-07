-- Add missing RLS policies for saved_jobs, rejection_analyses, weekly_reports

-- saved_jobs: allow users to update their own saved jobs (for ai_match_score)
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can update own saved jobs"
  ON saved_jobs FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own saved jobs"
  ON saved_jobs FOR DELETE
  USING (user_id = auth.uid());

-- rejection_analyses: allow users to update/delete their own
ALTER TABLE rejection_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own rejection analyses"
  ON rejection_analyses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own rejection analyses"
  ON rejection_analyses FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own rejection analyses"
  ON rejection_analyses FOR DELETE
  USING (user_id = auth.uid());

-- weekly_reports: allow users to update/delete their own
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own weekly reports"
  ON weekly_reports FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own weekly reports"
  ON weekly_reports FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own weekly reports"
  ON weekly_reports FOR DELETE
  USING (user_id = auth.uid());

-- user_profiles: allow users to delete their own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  USING (id = auth.uid());
