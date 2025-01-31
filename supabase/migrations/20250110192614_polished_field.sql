/*
  # Profile Enhancements

  1. New Columns
    - Added health metrics tracking
    - Added workout preferences
    - Added progress photos storage
    - Added injury history
    - Added nutrition preferences
    - Added achievement system
    - Added social connections
    - Added equipment access
    - Added recovery metrics
    - Added personalization settings

  2. Security
    - RLS policies for new columns
    - Indexes for performance
*/

-- Health Metrics
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS health_metrics jsonb DEFAULT '{
  "blood_pressure": null,
  "resting_heart_rate": null,
  "sleep_quality": null,
  "stress_level": null,
  "hydration": null
}'::jsonb;

-- Workout Preferences
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS workout_preferences jsonb DEFAULT '{
  "preferred_workout_time": "morning",
  "workout_duration": 60,
  "rest_interval": "medium",
  "music_preference": "high_energy",
  "workout_environment": "gym"
}'::jsonb;

-- Progress Photos
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS progress_photos jsonb DEFAULT '{
  "front": [],
  "side": [],
  "back": [],
  "timestamps": []
}'::jsonb;

-- Injury History
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS injury_history jsonb DEFAULT '{
  "current_injuries": [],
  "past_injuries": [],
  "movement_restrictions": []
}'::jsonb;

-- Nutrition Preferences
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nutrition_preferences jsonb DEFAULT '{
  "dietary_restrictions": [],
  "allergies": [],
  "meal_frequency": 3,
  "preferred_cuisines": [],
  "supplement_usage": []
}'::jsonb;

-- Achievement System
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '{
  "badges": [],
  "milestones": [],
  "streaks": {
    "current": 0,
    "longest": 0,
    "history": []
  }
}'::jsonb;

-- Social Connections
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_connections jsonb DEFAULT '{
  "workout_buddies": [],
  "followers": [],
  "following": [],
  "privacy_settings": {
    "profile_visibility": "friends",
    "progress_visibility": "private"
  }
}'::jsonb;

-- Equipment Access
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS equipment_access jsonb DEFAULT '{
  "home_equipment": [],
  "gym_access": false,
  "preferred_equipment": [],
  "resistance_bands": false,
  "weights": false
}'::jsonb;

-- Recovery Metrics
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS recovery_metrics jsonb DEFAULT '{
  "sleep_hours": null,
  "soreness_levels": {},
  "recovery_activities": [],
  "stress_factors": []
}'::jsonb;

-- Personalization Settings
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personalization_settings jsonb DEFAULT '{
  "motivation_quotes": true,
  "reminder_frequency": "daily",
  "preferred_content_format": "video",
  "difficulty_auto_adjust": true,
  "measurement_system": "metric"
}'::jsonb;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_profiles_workout_preferences ON public.profiles USING gin (workout_preferences);
CREATE INDEX IF NOT EXISTS idx_profiles_nutrition_preferences ON public.profiles USING gin (nutrition_preferences);
CREATE INDEX IF NOT EXISTS idx_profiles_achievements ON public.profiles USING gin (achievements);
CREATE INDEX IF NOT EXISTS idx_profiles_social_connections ON public.profiles USING gin (social_connections);

-- Update RLS policies
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