-- Drop all existing policies for user_measurements
DROP POLICY IF EXISTS "Users can manage their measurements" ON public.user_measurements;
DROP POLICY IF EXISTS "Users can manage their own measurements" ON public.user_measurements;

-- Create single unified policy
CREATE POLICY "Users can manage measurements"
  ON public.user_measurements FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure unique constraint exists
ALTER TABLE public.user_measurements
  DROP CONSTRAINT IF EXISTS unique_user_date,
  ADD CONSTRAINT unique_user_date UNIQUE(user_id, date);

-- Ensure index exists
DROP INDEX IF EXISTS idx_measurements_user_date;
CREATE INDEX IF NOT EXISTS idx_measurements_user_date 
  ON public.user_measurements(user_id, date);