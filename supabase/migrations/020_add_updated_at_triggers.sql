-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column to tables that need it (if missing)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE saved_jobs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE ai_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE career_analyses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE rejection_analyses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE weekly_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE cv_versions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE error_logs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Attach triggers (drop first to ensure idempotent)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_user_profiles_updated_at') THEN
    DROP TRIGGER set_user_profiles_updated_at ON user_profiles;
  END IF;
END $$;
CREATE TRIGGER set_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_applications_updated_at') THEN
    DROP TRIGGER set_applications_updated_at ON applications;
  END IF;
END $$;
CREATE TRIGGER set_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_saved_jobs_updated_at') THEN
    DROP TRIGGER set_saved_jobs_updated_at ON saved_jobs;
  END IF;
END $$;
CREATE TRIGGER set_saved_jobs_updated_at BEFORE UPDATE ON saved_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_ai_results_updated_at') THEN
    DROP TRIGGER set_ai_results_updated_at ON ai_results;
  END IF;
END $$;
CREATE TRIGGER set_ai_results_updated_at BEFORE UPDATE ON ai_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_career_analyses_updated_at') THEN
    DROP TRIGGER set_career_analyses_updated_at ON career_analyses;
  END IF;
END $$;
CREATE TRIGGER set_career_analyses_updated_at BEFORE UPDATE ON career_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_rejection_analyses_updated_at') THEN
    DROP TRIGGER set_rejection_analyses_updated_at ON rejection_analyses;
  END IF;
END $$;
CREATE TRIGGER set_rejection_analyses_updated_at BEFORE UPDATE ON rejection_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_weekly_reports_updated_at') THEN
    DROP TRIGGER set_weekly_reports_updated_at ON weekly_reports;
  END IF;
END $$;
CREATE TRIGGER set_weekly_reports_updated_at BEFORE UPDATE ON weekly_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_cv_versions_updated_at') THEN
    DROP TRIGGER set_cv_versions_updated_at ON cv_versions;
  END IF;
END $$;
CREATE TRIGGER set_cv_versions_updated_at BEFORE UPDATE ON cv_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_error_logs_updated_at') THEN
    DROP TRIGGER set_error_logs_updated_at ON error_logs;
  END IF;
END $$;
CREATE TRIGGER set_error_logs_updated_at BEFORE UPDATE ON error_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
