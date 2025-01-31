/*
  # Cart and Profile Enhancements

  1. New Tables
    - `cart_sessions` - Stores active shopping cart sessions
    - `saved_payment_methods` - Stores user payment preferences
    - `user_preferences` - Stores user settings and preferences
  
  2. Changes
    - Add payment and shipping preferences to profiles
    - Add cart session management
    - Add saved payment methods
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

-- User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text DEFAULT 'dark',
  notifications jsonb DEFAULT '{
    "order_updates": true,
    "promotional_emails": true,
    "workout_reminders": true
  }'::jsonb,
  default_payment_id uuid REFERENCES public.saved_payment_methods(id),
  default_shipping_address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their cart sessions"
  ON public.cart_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their payment methods"
  ON public.saved_payment_methods FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their preferences"
  ON public.user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cart_sessions_user ON cart_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON saved_payment_methods(user_id);

-- Functions
CREATE OR REPLACE FUNCTION public.cleanup_expired_carts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.cart_sessions
  SET status = 'abandoned'
  WHERE status = 'active' AND expires_at < now();
END;
$$;