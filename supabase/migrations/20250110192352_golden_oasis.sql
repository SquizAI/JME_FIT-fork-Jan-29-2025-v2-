/*
  # Add Theme Column to User Preferences

  1. Changes
    - Add theme column to user_preferences table
    - Set default theme value
    - Update existing rows
*/

-- Add theme column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences' 
    AND column_name = 'theme'
  ) THEN
    ALTER TABLE public.user_preferences 
    ADD COLUMN theme text DEFAULT 'dark';
  END IF;
END $$;

-- Update existing rows to have a theme
UPDATE public.user_preferences
SET theme = 'dark'
WHERE theme IS NULL;