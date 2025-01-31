/*
  # Fix Onboarding Schema

  1. Changes
    - Add onboarding status and step tracking
    - Add fitness profile fields
    - Add proper constraints and defaults
    - Update profile creation trigger

  2. Security
    - Maintain existing RLS policies
    - Add policies for onboarding fields
*/

-- Add onboarding fields to profiles if they don't exist
DO $$ 
BEGIN
  ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS onboarding_status text CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS onboarding_data jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS fitness_goals jsonb[] DEFAULT ARRAY[]::jsonb[],
    ADD COLUMN IF NOT EXISTS fitness_level text CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    ADD COLUMN IF NOT EXISTS availability jsonb DEFAULT '{}'::jsonb;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Update handle_new_user function to include onboarding fields
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
    onboarding_status,
    onboarding_step,
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
    'not_started',
    0,
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

-- Create index for onboarding status
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_status ON public.profiles(onboarding_status);

-- Update RLS policies
DO $$ 
BEGIN
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
END $$;