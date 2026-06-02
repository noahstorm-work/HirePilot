CREATE TABLE cv_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_label VARCHAR(20) NOT NULL,
  cv_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  interview_count INT DEFAULT 0,
  offer_count INT DEFAULT 0,
  application_count INT DEFAULT 0
);

CREATE INDEX idx_cv_versions_user_id ON cv_versions(user_id);

ALTER TABLE cv_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cv versions"
  ON cv_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cv versions"
  ON cv_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cv versions"
  ON cv_versions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cv versions"
  ON cv_versions FOR DELETE
  USING (auth.uid() = user_id);
