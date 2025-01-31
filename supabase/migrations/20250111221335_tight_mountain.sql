-- Add UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add slug column if it doesn't exist
ALTER TABLE public.products 
  ADD COLUMN IF NOT EXISTS slug text;

-- Update existing products with proper UUIDs and slugs
WITH updated_products AS (
  SELECT 
    id,
    CASE 
      WHEN id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN id::uuid
      ELSE uuid_generate_v4()
    END as new_id,
    COALESCE(slug, LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))) as new_slug
  FROM public.products
)
UPDATE public.products p
SET 
  id = up.new_id,
  slug = up.new_slug
FROM updated_products up
WHERE p.id = up.id;

-- Add sample products with proper UUIDs
INSERT INTO public.products (
  id,
  name,
  description,
  price,
  status,
  images,
  metadata,
  inventory_count,
  slug
) VALUES 
  (
    'e0c9f5a1-d6a4-4b6c-8f2a-3b5d2e8f9c0a',
    'Classic Training Tee',
    'Comfortable and breathable training t-shirt',
    29.99,
    'active',
    ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80'],
    jsonb_build_object(
      'category', 'apparel',
      'subcategory', 'tops',
      'sizes', ARRAY['S', 'M', 'L', 'XL'],
      'colors', ARRAY['Black', 'Gray', 'Navy'],
      'colorImages', jsonb_build_object(
        'Black', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
        'Gray', 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80',
        'Navy', 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=800&q=80'
      )
    ),
    100,
    'classic-training-tee'
  ),
  (
    'f1d0e6b2-e7b5-4c7d-9f3b-4c6d3f0a0d1b',
    'Performance Hoodie',
    'Premium athletic hoodie for training and lifestyle',
    54.99,
    'active',
    ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80'],
    jsonb_build_object(
      'category', 'apparel',
      'subcategory', 'outerwear',
      'sizes', ARRAY['S', 'M', 'L', 'XL'],
      'colors', ARRAY['Black', 'Gray'],
      'colorImages', jsonb_build_object(
        'Black', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80',
        'Gray', 'https://images.unsplash.com/photo-1556821833-77da8d993d8c?auto=format&fit=crop&w=800&q=80'
      )
    ),
    75,
    'performance-hoodie'
  )
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  status = EXCLUDED.status,
  images = EXCLUDED.images,
  metadata = EXCLUDED.metadata,
  inventory_count = EXCLUDED.inventory_count,
  slug = EXCLUDED.slug;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_products_id_slug ON public.products(id, slug);
CREATE INDEX IF NOT EXISTS idx_products_metadata_category ON public.products USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- Add constraints
ALTER TABLE public.products
  ADD CONSTRAINT products_slug_unique UNIQUE (slug),
  ALTER COLUMN slug SET NOT NULL;