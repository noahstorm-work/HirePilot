-- Skill progress tracking table
-- Tracks per-skill status across career analysis runs

CREATE TABLE skill_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  status TEXT CHECK (status IN ('identified', 'in_progress', 'completed')) DEFAULT 'identified',
  identified_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

ALTER TABLE skill_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own skill progress"
  ON skill_progress FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_skill_progress_user ON skill_progress(user_id);
