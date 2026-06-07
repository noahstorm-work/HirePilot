-- Enable RLS on error_logs (was missing)
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert error logs (client-side logging needs this)
CREATE POLICY "Anyone can insert error logs"
  ON error_logs FOR INSERT
  WITH CHECK (true);

-- Users can read their own error logs
CREATE POLICY "Users can read own error logs"
  ON error_logs FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);
