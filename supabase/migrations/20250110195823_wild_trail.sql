/*
  # Fix Profile Settings

  1. New Tables
    - user_measurements - For tracking body measurements
    - user_goals - For tracking fitness goals
  
  2. Updates
    - Add missing columns to profiles table
    - Update profile triggers and functions
    
  3. Security
    - Add proper RLS policies
*/

-- Create user_measurements table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  weight decimal(5,2),
  body_fat decimal(4,1),
  chest decimal(5,2),
  waist decimal(5,2),
  hips decimal(5,2),
  arms decimal(5,2),
  thighs decimal(5,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_goals table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  target text,
  deadline date,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can manage their measurements"
  ON public.user_measurements FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their goals"
  ON public.user_goals FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_measurements_user_date 
  ON public.user_measurements(user_id, date);
CREATE INDEX IF NOT EXISTS idx_goals_user_status 
  ON public.user_goals(user_id, status);

-- Function to update profile on measurement changes
CREATE OR REPLACE FUNCTION public.update_profile_latest_measurements()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET latest_measurements = jsonb_build_object(
    'weight', NEW.weight,
    'bodyFat', NEW.body_fat,
    'chest', NEW.chest,
    'waist', NEW.waist,
    'hips', NEW.hips,
    'arms', NEW.arms,
    'thighs', NEW.thighs,
    'date', NEW.date,
    'updatedAt', NEW.updated_at
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;