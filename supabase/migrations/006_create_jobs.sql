CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT,
  source VARCHAR(20),
  company VARCHAR(200) NOT NULL,
  role_title VARCHAR(200) NOT NULL,
  description TEXT,
  salary_min INT,
  salary_max INT,
  salary_currency VARCHAR(3) DEFAULT 'USD',
  location TEXT,
  remote_type TEXT,
  company_logo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(external_id, source)
);

CREATE INDEX idx_jobs_external ON jobs(external_id, source);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read jobs"
  ON jobs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
