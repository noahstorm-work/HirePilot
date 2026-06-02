CREATE TABLE IF NOT EXISTS ai_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE UNIQUE,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  missing_skills JSONB NOT NULL DEFAULT '[]',
  cv_improvements JSONB NOT NULL DEFAULT '[]',
  cover_letter TEXT,
  interview_tips JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_analysis_application_id ON ai_analysis_results(application_id);

ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analysis"
  ON ai_analysis_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = ai_analysis_results.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own analysis"
  ON ai_analysis_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = ai_analysis_results.application_id
      AND applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own analysis"
  ON ai_analysis_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.id = ai_analysis_results.application_id
      AND applications.user_id = auth.uid()
    )
  );
