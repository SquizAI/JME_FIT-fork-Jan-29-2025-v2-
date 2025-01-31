-- Add foreign key relationship between cart_items and products
ALTER TABLE public.cart_items
  DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey,
  ADD CONSTRAINT cart_items_product_id_fkey
  FOREIGN KEY (product_id)
  REFERENCES public.products(id)
  ON DELETE SET NULL;

-- Create index for product lookups
CREATE INDEX IF NOT EXISTS idx_products_id_slug ON public.products(id, slug);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view cart items" ON public.cart_items;
CREATE POLICY "Users can view cart items"
  ON public.cart_items FOR SELECT
  TO authenticated
  USING (
    cart_id IN (
      SELECT id FROM public.carts WHERE user_id = auth.uid()
    )
  );