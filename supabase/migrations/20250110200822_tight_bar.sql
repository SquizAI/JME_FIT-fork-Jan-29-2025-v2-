-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their profile" ON public.profiles;

-- Create comprehensive profile policies
CREATE POLICY "Users can manage their own profile"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure profiles table has RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
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
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Update handle_new_user function to include all necessary fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    display_name,
    role,
    preferences,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    '{
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
    }'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    updated_at = NOW();
  RETURN NEW;
END;
$$;