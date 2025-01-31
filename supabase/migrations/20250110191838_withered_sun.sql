/*
  # Fix Payment Preferences Relationship

  1. Changes
    - Drop existing foreign key constraint if it exists
    - Add default_payment_id column to user_preferences if it doesn't exist
    - Re-add foreign key constraint with proper references
    - Update indexes for performance
*/

-- First ensure the column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'default_payment_id'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD COLUMN default_payment_id uuid;
  END IF;
END $$;

-- Drop existing constraint if it exists
ALTER TABLE public.user_preferences
  DROP CONSTRAINT IF EXISTS user_preferences_default_payment_id_fkey;

-- Add the foreign key constraint
ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_default_payment_id_fkey
  FOREIGN KEY (default_payment_id)
  REFERENCES public.saved_payment_methods(id)
  ON DELETE SET NULL;

-- Add index for the foreign key
CREATE INDEX IF NOT EXISTS idx_user_preferences_default_payment
  ON public.user_preferences(default_payment_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can manage their preferences" ON public.user_preferences;
CREATE POLICY "Users can manage their preferences"
  ON public.user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);