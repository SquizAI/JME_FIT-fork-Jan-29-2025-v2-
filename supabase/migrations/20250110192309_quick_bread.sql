/*
  # Fix User Preferences

  1. Changes
    - Add trigger to automatically create user preferences
    - Update foreign key relationships
    - Add missing indexes
*/

-- Ensure user preferences are created for existing users
INSERT INTO public.user_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Update or create trigger for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_preferences (
    user_id,
    theme,
    notifications,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    'dark',
    '{
      "order_updates": true,
      "promotional_emails": true,
      "workout_reminders": true
    }'::jsonb,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_preferences();

-- Add missing indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_theme 
  ON public.user_preferences(user_id, theme);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can manage their preferences" ON public.user_preferences;
CREATE POLICY "Users can manage their preferences"
  ON public.user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);