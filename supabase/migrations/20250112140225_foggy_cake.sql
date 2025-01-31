-- Add progress photos support
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS progress_photos jsonb DEFAULT '{
    "front": [],
    "side": [],
    "back": [],
    "timestamps": []
  }'::jsonb;

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  category text,
  points integer DEFAULT 0,
  requirements jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(user_id, achievement_id)
);

-- Create social connections table
CREATE TABLE IF NOT EXISTS public.social_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  connected_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, connected_user_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Everyone can view achievements"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can view their achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their social connections"
  ON public.social_connections FOR ALL
  TO authenticated
  USING (auth.uid() IN (user_id, connected_user_id))
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_users ON public.social_connections(user_id, connected_user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_status ON public.social_connections(status);

-- Add some default achievements
INSERT INTO public.achievements (name, description, category, points, requirements) VALUES
  ('Early Bird', 'Complete 10 workouts before 8am', 'workout', 100, '{"workout_count": 10, "before_time": "08:00"}'),
  ('Consistency King', 'Work out 5 days in a row', 'streak', 150, '{"consecutive_days": 5}'),
  ('Weight Loss Warrior', 'Lose 10 lbs', 'progress', 200, '{"weight_loss": 10}'),
  ('Strength Milestone', 'Bench press bodyweight', 'strength', 250, '{"exercise": "bench_press", "relative_weight": 1.0}')
ON CONFLICT DO NOTHING;