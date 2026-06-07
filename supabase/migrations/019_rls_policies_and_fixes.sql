-- Add missing RLS policies for saved_jobs, rejection_analyses, weekly_reports

-- saved_jobs: allow users to update/delete their own saved jobs
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own saved jobs' AND tablename = 'saved_jobs') THEN
    CREATE POLICY "Users can update own saved jobs" ON saved_jobs FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own saved jobs' AND tablename = 'saved_jobs') THEN
    CREATE POLICY "Users can delete own saved jobs" ON saved_jobs FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- rejection_analyses
ALTER TABLE rejection_analyses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own rejection analyses' AND tablename = 'rejection_analyses') THEN
    CREATE POLICY "Users can insert own rejection analyses" ON rejection_analyses FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own rejection analyses' AND tablename = 'rejection_analyses') THEN
    CREATE POLICY "Users can update own rejection analyses" ON rejection_analyses FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own rejection analyses' AND tablename = 'rejection_analyses') THEN
    CREATE POLICY "Users can delete own rejection analyses" ON rejection_analyses FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- weekly_reports
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own weekly reports' AND tablename = 'weekly_reports') THEN
    CREATE POLICY "Users can insert own weekly reports" ON weekly_reports FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own weekly reports' AND tablename = 'weekly_reports') THEN
    CREATE POLICY "Users can update own weekly reports" ON weekly_reports FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own weekly reports' AND tablename = 'weekly_reports') THEN
    CREATE POLICY "Users can delete own weekly reports" ON weekly_reports FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

-- user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own profile' AND tablename = 'user_profiles') THEN
    CREATE POLICY "Users can delete own profile" ON user_profiles FOR DELETE USING (id = auth.uid());
  END IF;
END $$;
