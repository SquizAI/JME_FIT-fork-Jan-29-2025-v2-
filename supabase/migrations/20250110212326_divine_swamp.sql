-- Add default products if they don't exist
INSERT INTO public.products (id, name, description, price, status)
VALUES 
  ('2dc36526-c95c-4331-889c-2118f222e8a9', 'App Workouts Only - Self-Led', 'Monthly subscription to app workouts', 29.99, 'active'),
  ('81bac6bd-384e-4882-baa1-99a1532ab7c4', 'Nutrition Only', '12-week nutrition coaching program', 199.99, 'active'),
  ('44b0b0a5-3a5a-4b0e-b643-bf5247956365', 'Plus Membership', 'Complete transformation package', 349.99, 'active')
ON CONFLICT (id) DO NOTHING;

-- Ensure cart_items has proper foreign key constraint
ALTER TABLE IF EXISTS public.cart_items 
  DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;

ALTER TABLE public.cart_items
  ADD CONSTRAINT cart_items_product_id_fkey 
  FOREIGN KEY (product_id) 
  REFERENCES public.products(id) 
  ON DELETE SET NULL;

-- Create index for cart items
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items(product_id);