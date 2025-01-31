-- Add UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Update product IDs to use proper UUIDs
UPDATE public.products
SET id = uuid_generate_v4()
WHERE id NOT LIKE '%-%-%-%-%';

-- Add sample apparel products with proper UUIDs
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

-- Add constraint to ensure either ID or slug is unique
ALTER TABLE public.products
  ADD CONSTRAINT products_id_or_slug_unique UNIQUE (id, slug);