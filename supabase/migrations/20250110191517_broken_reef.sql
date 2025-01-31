/*
  # Fix Cart and Preferences Tables

  1. Changes
    - Create cart_sessions table if not exists
    - Create user_preferences table if not exists
    - Create saved_payment_methods table if not exists
    - Add proper relationships and constraints
    - Update RLS policies
    - Add automatic preference creation for new users
*/

-- Cart Sessions
CREATE TABLE IF NOT EXISTS public.cart_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text CHECK (status IN ('active', 'converted', 'abandoned')) DEFAULT 'active',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text DEFAULT 'dark',
  notifications jsonb DEFAULT '{
    "order_updates": true,
    "promotional_emails": true,
    "workout_reminders": true
  }'::jsonb,
  default_payment_id uuid,
  default_shipping_address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Saved Payment Methods
CREATE TABLE IF NOT EXISTS public.saved_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_type text NOT NULL,
  last_four text,
  expiry_date text,
  is_default boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key for default payment method after table exists
ALTER TABLE public.user_preferences
  ADD CONSTRAINT user_preferences_default_payment_id_fkey
  FOREIGN KEY (default_payment_id)
  REFERENCES public.saved_payment_methods(id)
  ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their cart sessions"
  ON public.cart_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their preferences"
  ON public.user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their payment methods"
  ON public.saved_payment_methods FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cart_sessions_user_status ON cart_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON saved_payment_methods(user_id);

-- Function to create user preferences on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for new user preferences
DROP TRIGGER IF EXISTS on_auth_user_created_preferences ON auth.users;
CREATE TRIGGER on_auth_user_created_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_preferences();