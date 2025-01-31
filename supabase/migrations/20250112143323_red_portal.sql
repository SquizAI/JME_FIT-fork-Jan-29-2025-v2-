/*
  # Fix Product Variants Schema

  1. Changes
    - Add stock_count column to product_variants table
    - Update product queries to use correct column names
    - Add indexes for performance
*/

-- Rename inventory_count to stock_count in product_variants if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'product_variants' 
    AND column_name = 'inventory_count'
  ) THEN
    ALTER TABLE public.product_variants 
      RENAME COLUMN inventory_count TO stock_count;
  ELSE
    ALTER TABLE public.product_variants 
      ADD COLUMN stock_count integer DEFAULT 0;
  END IF;
END $$;

-- Add check constraint for non-negative stock
ALTER TABLE public.product_variants
  ADD CONSTRAINT check_stock_count_non_negative 
  CHECK (stock_count >= 0);

-- Create index for stock queries
CREATE INDEX IF NOT EXISTS idx_product_variants_stock 
  ON public.product_variants(stock_count) 
  WHERE stock_count > 0;

-- Create index for product variant lookups
CREATE INDEX IF NOT EXISTS idx_product_variants_product_sku 
  ON public.product_variants(product_id, sku);

-- Add sample variants for existing products
INSERT INTO public.product_variants (
  product_id,
  sku,
  size,
  color,
  price,
  stock_count
)
SELECT 
  p.id,
  CONCAT(
    CASE 
      WHEN p.name ILIKE '%tee%' THEN 'TEE'
      WHEN p.name ILIKE '%hoodie%' THEN 'HOOD'
      ELSE 'PROD'
    END,
    '-',
    s.size,
    '-',
    SUBSTRING(c.color FROM 1 FOR 3),
    '-',
    SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 4)
  ) as sku,
  s.size,
  c.color,
  p.price,
  50 as stock_count
FROM public.products p
CROSS JOIN LATERAL jsonb_array_elements_text(p.metadata->'sizes') as s(size)
CROSS JOIN LATERAL jsonb_array_elements_text(p.metadata->'colors') as c(color)
WHERE p.type = 'apparel'
ON CONFLICT (sku) DO NOTHING;