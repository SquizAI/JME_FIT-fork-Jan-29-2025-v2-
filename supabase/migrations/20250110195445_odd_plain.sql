/*
  # Add Measurements Table and Profile Updates

  1. New Tables
    - `user_measurements` - Track user body measurements over time
  
  2. Profile Updates
    - Add measurement-related fields to profiles
    
  3. Security
    - RLS policies for measurements table
*/

-- Create measurements table
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

-- Enable RLS
ALTER TABLE public.user_measurements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own measurements"
  ON public.user_measurements FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_measurements_user_date 
  ON public.user_measurements(user_id, date);

-- Add measurement summary to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS latest_measurements jsonb;