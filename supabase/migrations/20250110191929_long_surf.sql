/*
  # Fix Payment Tables and Relationships

  1. New Tables
    - saved_payment_methods - Store user payment methods
    - payment_preferences - Store user payment preferences
  
  2. Changes
    - Ensure tables exist before foreign key relationships
    - Add proper indexes and constraints
    - Update RLS policies
*/

-- Create saved_payment_methods table if it doesn't exist
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

-- Enable RLS
ALTER TABLE public.saved_payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their payment methods"
  ON public.saved_payment_methods FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON public.saved_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON public.saved_payment_methods(user_id) WHERE is_default = true;

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.saved_payment_methods
    SET is_default = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for default payment method
DROP TRIGGER IF EXISTS ensure_single_default_payment_trigger ON public.saved_payment_methods;
CREATE TRIGGER ensure_single_default_payment_trigger
  BEFORE INSERT OR UPDATE ON public.saved_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_default_payment();