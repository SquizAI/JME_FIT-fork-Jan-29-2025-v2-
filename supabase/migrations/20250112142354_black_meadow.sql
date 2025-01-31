/*
  # Fix Product Schema for Memberships

  1. Changes
    - Add membership type to products table
    - Update existing products with correct types
    - Add proper constraints
    - Add membership products

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing type check constraint
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_type_check;

-- Add new type check constraint with all needed types
ALTER TABLE public.products
  ADD CONSTRAINT products_type_check 
  CHECK (type IN ('apparel', 'supplement', 'equipment', 'digital', 'membership'));

-- Update existing products with correct types
UPDATE public.products
SET type = CASE
  WHEN metadata->>'category' = 'memberships' THEN 'membership'
  WHEN metadata->>'category' = 'apparel' THEN 'apparel'
  WHEN metadata->>'category' = 'supplements' THEN 'supplement'
  WHEN metadata->>'category' = 'equipment' THEN 'equipment'
  ELSE 'digital'
END
WHERE type IS NULL;

-- Add membership products
INSERT INTO public.products (
  id,
  name,
  description,
  price,
  status,
  images,
  metadata,
  inventory_count,
  slug,
  type
) VALUES 
  (
    '36ccea16-19f4-4571-8889-e19bc7a7558e',
    'App Workouts (Self-Led)',
    'Access to all app-based workouts with monthly updates and progress tracking',
    29.99,
    'active',
    ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1950&q=80'],
    jsonb_build_object(
      'category', 'memberships',
      'interval', 'month',
      'features', ARRAY[
        'Access to all app workouts',
        'Monthly workout updates',
        'Progress tracking',
        'Exercise video guides',
        'Self-guided experience'
      ]
    ),
    0,
    'app-workouts-self-led',
    'membership'
  ),
  (
    '81bac6bd-384e-4882-baa1-99a1532ab7c4',
    'Nutrition Only',
    'Custom meal plans and nutrition coaching for 12 weeks',
    199.99,
    'active',
    ARRAY['https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?auto=format&fit=crop&w=1950&q=80'],
    jsonb_build_object(
      'category', 'memberships',
      'duration', '12 weeks',
      'features', ARRAY[
        'Custom meal plans',
        'Macro calculations',
        'Weekly check-ins',
        'Nutrition guidance',
        'Recipe suggestions'
      ]
    ),
    0,
    'nutrition-only',
    'membership'
  ),
  (
    '44b0b0a5-3a5a-4b0e-b643-bf5247956365',
    'Plus Membership',
    'Complete transformation package with workouts and nutrition',
    349.99,
    'active',
    ARRAY['https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=1950&q=80'],
    jsonb_build_object(
      'category', 'memberships',
      'duration', '12 weeks',
      'features', ARRAY[
        'Custom workouts',
        'Nutrition planning',
        'Direct coach access',
        'Form checks',
        'Weekly check-ins'
      ]
    ),
    0,
    'plus-membership',
    'membership'
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
  slug = EXCLUDED.slug,
  type = EXCLUDED.type;