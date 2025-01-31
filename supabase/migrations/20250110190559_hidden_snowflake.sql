/*
  # Fix Orders Schema

  1. Changes
    - Add proper foreign key relationships between orders, order_items and products
    - Add indexes for performance
    - Update RLS policies
*/

-- Drop existing constraints if they exist
ALTER TABLE IF EXISTS public.order_items 
  DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Ensure proper foreign key relationship
ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_product_id_fkey 
  FOREIGN KEY (product_id) 
  REFERENCES public.products(id) 
  ON DELETE SET NULL;

-- Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_order_items_order_product 
  ON public.order_items(order_id, product_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders 
      WHERE user_id = auth.uid()
    )
  );