/*
  # Fix Cart Items Foreign Key Constraint

  1. Changes
    - Clean up orphaned cart items
    - Add foreign key constraint safely
  
  2. Security
    - Maintains existing RLS policies
*/

-- Clean up orphaned cart items before adding constraint
DELETE FROM public.cart_items
WHERE product_id NOT IN (SELECT id FROM public.products);

-- Add sample product if products table is empty
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.products LIMIT 1) THEN
    INSERT INTO public.products (
      id,
      name,
      description,
      price,
      status
    ) VALUES (
      'e8c9acf1-5c5f-4f8b-a9c2-3f2d7a571c5c',
      'Test Product',
      'A test product',
      29.99,
      'active'
    );
  END IF;
END $$;

-- Now safely add the constraint
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