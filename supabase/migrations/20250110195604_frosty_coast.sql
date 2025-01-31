/*
  # Fix Measurements Functionality

  1. Updates
    - Drop existing policy if it exists
    - Create new policy with proper checks
    - Add trigger to update latest measurements in profiles
  
  2. Security
    - Ensure proper RLS policies
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can manage their own measurements" ON public.user_measurements;

-- Create new policy
CREATE POLICY "Users can manage their measurements"
  ON public.user_measurements FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update latest measurements in profile
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

-- Create trigger for updating latest measurements
DROP TRIGGER IF EXISTS update_profile_measurements ON public.user_measurements;
CREATE TRIGGER update_profile_measurements
  AFTER INSERT OR UPDATE ON public.user_measurements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_latest_measurements();