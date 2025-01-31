-- Add sample apparel products
INSERT INTO public.products (
  id,
  name,
  description,
  price,
  status,
  images,
  metadata,
  inventory_count
) VALUES 
  (
    'classic-tee-001',
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
    100
  ),
  (
    'performance-hoodie-001',
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
    75
  )
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  status = EXCLUDED.status,
  images = EXCLUDED.images,
  metadata = EXCLUDED.metadata,
  inventory_count = EXCLUDED.inventory_count;

-- Create index for product category lookups
CREATE INDEX IF NOT EXISTS idx_products_metadata_category ON public.products USING gin ((metadata->>'category'));