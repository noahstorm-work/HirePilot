CREATE TABLE rejection_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  likely_reasons TEXT[] DEFAULT '{}',
  skills_gaps TEXT[] DEFAULT '{}',
  cv_weaknesses TEXT[] DEFAULT '{}',
  market_competition_note TEXT,
  improvement_plan JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(application_id)
);

CREATE INDEX idx_rejection_analyses_application_id ON rejection_analyses(application_id);

ALTER TABLE rejection_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rejection analyses"
  ON rejection_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rejection analyses"
  ON rejection_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);
