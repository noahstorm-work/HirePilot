-- Add new columns to applications
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS job_description TEXT,
  ADD COLUMN IF NOT EXISTS salary_range TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS remote_type TEXT,
  ADD COLUMN IF NOT EXISTS application_source VARCHAR(50) DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS match_score INT,
  ADD COLUMN IF NOT EXISTS cv_version_id UUID REFERENCES cv_versions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update status check to include 'Saved'
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_status_check;

ALTER TABLE applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('Saved', 'Applied', 'Interview', 'Offer', 'Rejected'));
