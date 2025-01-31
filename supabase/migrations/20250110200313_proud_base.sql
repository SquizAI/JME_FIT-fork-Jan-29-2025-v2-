-- Create user_measurements table
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
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_date UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.user_measurements ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can manage their measurements"
  ON public.user_measurements FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_measurements_user_date 
  ON public.user_measurements(user_id, date);

-- Function to update profile latest measurements
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