/*
  # Fix Schema Issues

  1. Changes
    - Add missing role column to profiles if needed
    - Update profile trigger to include role
    - Fix cart_items foreign key relationships
  
  2. Security
    - Update RLS policies
*/

-- Add role column to profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'user';
  END IF;
END $$;

-- Ensure cart_items has correct relationships
DO $$ 
BEGIN
  -- Drop existing foreign key if it exists
  ALTER TABLE IF EXISTS public.cart_items 
    DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
  
  -- Add correct foreign key
  ALTER TABLE public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey 
    FOREIGN KEY (product_id) 
    REFERENCES public.products(id) 
    ON DELETE CASCADE;
END $$;

-- Update or create profile policies
DO $$ 
BEGIN
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
END $$;

-- Update profile trigger to include role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    display_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    updated_at = NOW();
  RETURN NEW;
END;
$$;