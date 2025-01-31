/*
  # Fix Cart and Products Schema

  1. New Tables
    - Add sample products table entries
    - Fix cart_items foreign key constraints
  
  2. Security
    - Update RLS policies
*/

-- Add sample products if none exist
INSERT INTO public.products (id, name, description, price, status)
SELECT 
  gen_random_uuid(),
  'App Workouts Subscription',
  'Monthly subscription to app workouts',
  29.99,
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM public.products WHERE name = 'App Workouts Subscription'
);

INSERT INTO public.products (id, name, description, price, status)
SELECT 
  gen_random_uuid(),
  'Nutrition Coaching',
  '12-week nutrition coaching program',
  199.99,
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM public.products WHERE name = 'Nutrition Coaching'
);

INSERT INTO public.products (id, name, description, price, status)
SELECT 
  gen_random_uuid(),
  'Plus Membership',
  'Complete transformation package',
  349.99,
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM public.products WHERE name = 'Plus Membership'
);

-- Fix cart_items foreign key constraint
ALTER TABLE IF EXISTS public.cart_items 
  DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;

ALTER TABLE public.cart_items
  ADD CONSTRAINT cart_items_product_id_fkey 
  FOREIGN KEY (product_id) 
  REFERENCES public.products(id) 
  ON DELETE SET NULL;

-- Create index for cart items
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items(product_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can manage their cart items" ON public.cart_items;
CREATE POLICY "Users can manage their cart items"
  ON public.cart_items FOR ALL
  TO authenticated
  USING (
    cart_id IN (
      SELECT id FROM public.carts WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    cart_id IN (
      SELECT id FROM public.carts WHERE user_id = auth.uid()
    )
  );