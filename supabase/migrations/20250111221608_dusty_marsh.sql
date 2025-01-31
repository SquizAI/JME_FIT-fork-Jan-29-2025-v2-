-- Add inventory_count column to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS inventory_count integer DEFAULT 0;

-- Update existing products with default inventory
UPDATE public.products
SET inventory_count = 100
WHERE inventory_count IS NULL;

-- Add check constraint to prevent negative inventory
ALTER TABLE public.products
  ADD CONSTRAINT check_inventory_count_non_negative 
  CHECK (inventory_count >= 0);

-- Create index for inventory queries
CREATE INDEX IF NOT EXISTS idx_products_inventory 
  ON public.products(inventory_count) 
  WHERE inventory_count > 0;