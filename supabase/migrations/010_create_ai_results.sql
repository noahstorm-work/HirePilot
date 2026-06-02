CREATE TABLE ai_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  match_score INT CHECK (match_score >= 0 AND match_score <= 100),
  strengths TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  cv_suggestions TEXT[] DEFAULT '{}',
  cover_letter TEXT,
  follow_up_email TEXT,
  interview_questions JSONB,
  company_insights TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(application_id)
);

CREATE INDEX idx_ai_results_application_id ON ai_results(application_id);

ALTER TABLE ai_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai results"
  ON ai_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = ai_results.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own ai results"
  ON ai_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = ai_results.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own ai results"
  ON ai_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = ai_results.application_id
      AND applications.user_id = auth.uid()
    )
  );
