/*
  # Enhanced User Profile Schema

  1. New Fields
    - Personal Information
      - `height` (decimal)
      - `weight` (decimal)
      - `date_of_birth` (date)
      - `gender` (text)
      - `phone` (text)
      - `emergency_contact` (jsonb)
    - Health Information
      - `medical_conditions` (text[])
      - `injuries` (text[])
      - `allergies` (text[])
      - `medications` (text[])
    - Fitness Profile
      - `fitness_goals` (jsonb[]) - Already exists
      - `fitness_level` (text) - Already exists
      - `preferred_training_style` (text[])
      - `equipment_access` (text[])
      - `dietary_preferences` (text[])
      - `measurements` (jsonb)
    - Preferences
      - `communication_preferences` (jsonb)
      - `notification_settings` (jsonb)
      - `preferred_units` (text)
      - `language` (text)

  2. Security
    - RLS policies updated for new fields
*/

-- Add new columns to profiles table
ALTER TABLE public.profiles
  -- Personal Information
  ADD COLUMN IF NOT EXISTS height decimal(5,2),
  ADD COLUMN IF NOT EXISTS weight decimal(5,2),
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS emergency_contact jsonb DEFAULT '{}'::jsonb,

  -- Health Information
  ADD COLUMN IF NOT EXISTS medical_conditions text[],
  ADD COLUMN IF NOT EXISTS injuries text[],
  ADD COLUMN IF NOT EXISTS allergies text[],
  ADD COLUMN IF NOT EXISTS medications text[],

  -- Fitness Profile
  ADD COLUMN IF NOT EXISTS preferred_training_style text[],
  ADD COLUMN IF NOT EXISTS equipment_access text[],
  ADD COLUMN IF NOT EXISTS dietary_preferences text[],
  ADD COLUMN IF NOT EXISTS measurements jsonb DEFAULT '{}'::jsonb,

  -- Preferences
  ADD COLUMN IF NOT EXISTS communication_preferences jsonb DEFAULT '{
    "email": true,
    "sms": false,
    "push": true
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{
    "workout_reminders": true,
    "progress_updates": true,
    "nutrition_reminders": true
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS preferred_units text DEFAULT 'imperial' CHECK (preferred_units IN ('metric', 'imperial')),
  ADD COLUMN IF NOT EXISTS language text DEFAULT 'en' CHECK (language ~ '^[a-z]{2}(-[A-Z]{2})?$');

-- Create type for onboarding steps
CREATE TYPE onboarding_step_type AS ENUM (
  'personal_info',
  'health_info',
  'fitness_goals',
  'training_preferences',
  'schedule',
  'completed'
);

-- Add onboarding progress tracking
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS onboarding_step,
  ADD COLUMN IF NOT EXISTS onboarding_progress jsonb DEFAULT '{
    "current_step": "personal_info",
    "completed_steps": [],
    "last_updated": null
  }'::jsonb;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_fitness_level ON public.profiles(fitness_level);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_units ON public.profiles(preferred_units);
CREATE INDEX IF NOT EXISTS idx_profiles_language ON public.profiles(language);

-- Update RLS policies
CREATE POLICY "Users can read their own sensitive information"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Function to update profile completion status
CREATE OR REPLACE FUNCTION public.check_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if all required fields are filled
  IF NEW.display_name IS NOT NULL 
     AND NEW.height IS NOT NULL 
     AND NEW.weight IS NOT NULL 
     AND NEW.date_of_birth IS NOT NULL
     AND NEW.fitness_level IS NOT NULL
     AND NEW.fitness_goals IS NOT NULL
     AND NEW.availability IS NOT NULL THEN
    
    NEW.onboarding_status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically update profile completion
DROP TRIGGER IF EXISTS check_profile_completion_trigger ON public.profiles;
CREATE TRIGGER check_profile_completion_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_completion();