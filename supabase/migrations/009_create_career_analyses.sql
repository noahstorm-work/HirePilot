CREATE TABLE career_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interview_readiness_score INT NOT NULL CHECK (interview_readiness_score >= 0 AND interview_readiness_score <= 100),
  cv_score INT NOT NULL CHECK (cv_score >= 0 AND cv_score <= 100),
  linkedin_score INT CHECK (linkedin_score >= 0 AND linkedin_score <= 100),
  github_score INT CHECK (github_score >= 0 AND github_score <= 100),
  portfolio_score INT CHECK (portfolio_score >= 0 AND portfolio_score <= 100),
  market_competitiveness_score INT NOT NULL CHECK (market_competitiveness_score >= 0 AND market_competitiveness_score <= 100),
  recruiter_appeal_score INT NOT NULL CHECK (recruiter_appeal_score >= 0 AND recruiter_appeal_score <= 100),
  interview_probability INT NOT NULL CHECK (interview_probability >= 0 AND interview_probability <= 100),
  skills_gap_analysis JSONB DEFAULT '[]',
  missing_keywords TEXT[] DEFAULT '{}',
  missing_technologies TEXT[] DEFAULT '{}',
  missing_experience_areas TEXT[] DEFAULT '{}',
  top_improvements JSONB DEFAULT '[]',
  target_score INT NOT NULL CHECK (target_score >= 0 AND target_score <= 100),
  thirty_day_plan JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_career_analyses_user_id ON career_analyses(user_id);

ALTER TABLE career_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own career analyses"
  ON career_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own career analyses"
  ON career_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own career analyses"
  ON career_analyses FOR UPDATE
  USING (auth.uid() = user_id);
