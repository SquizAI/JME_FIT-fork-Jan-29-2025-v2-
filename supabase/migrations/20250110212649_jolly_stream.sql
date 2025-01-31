-- Add slug column to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug text;

-- Update existing products with slugs
UPDATE public.products
SET slug = CASE 
  WHEN id = '2dc36526-c95c-4331-889c-2118f222e8a9' THEN 'app-workouts'
  WHEN id = '81bac6bd-384e-4882-baa1-99a1532ab7c4' THEN 'nutrition-only'
  WHEN id = '44b0b0a5-3a5a-4b0e-b643-bf5247956365' THEN 'plus-membership'
  ELSE lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
END
WHERE slug IS NULL;

-- Make slug required and unique
ALTER TABLE public.products
  ALTER COLUMN slug SET NOT NULL,
  ADD CONSTRAINT products_slug_unique UNIQUE (slug);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);