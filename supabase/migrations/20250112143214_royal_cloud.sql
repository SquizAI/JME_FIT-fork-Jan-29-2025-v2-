/*
  # Fix Product Types

  1. Changes
    - Update product type check constraint to include all needed types
    - Update existing products with correct types
    - Add proper metadata for membership products
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
WHERE type IS NULL OR type NOT IN ('apparel', 'supplement', 'equipment', 'digital', 'membership');

-- Update specific products to ensure proper types and metadata
UPDATE public.products
SET 
  type = 'membership',
  metadata = jsonb_build_object(
    'category', 'memberships',
    'duration', '12 weeks',
    'features', ARRAY[
      'Custom workout plans',
      'Nutrition guidance',
      'Weekly check-ins',
      'Progress tracking',
      'Form check videos',
      'Support via messaging'
    ]
  )
WHERE id IN (
  '4068f1ae-b207-4c18-afa2-2e594e0b73d5',
  '693071c7-dce5-4369-a536-7e5edb4ec19c'
);