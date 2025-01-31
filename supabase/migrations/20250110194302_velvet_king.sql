-- Update profiles table to use snake_case consistently
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS fitness_level text CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  ADD COLUMN IF NOT EXISTS goals jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    },
    "workoutPreferences": {
      "location": "gym",
      "equipment": [],
      "focusAreas": []
    },
    "dietaryRestrictions": [],
    "units": "metric"
  }'::jsonb;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_fitness_level ON public.profiles(fitness_level);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);