/*
  # Fix Invalid Product Types

  1. Changes
    - Update SHRED Program and Macro Package products with correct type
    - Add proper metadata for these products
*/

-- Update SHRED Program
UPDATE public.products
SET 
  type = 'membership',
  metadata = jsonb_build_object(
    'category', 'memberships',
    'duration', '6 weeks',
    'features', ARRAY[
      'Custom workout plans',
      'Nutrition guidance',
      'Weekly check-ins',
      'Progress tracking',
      'Form check videos',
      'Support via messaging'
    ]
  )
WHERE id = '693071c7-dce5-4369-a536-7e5edb4ec19c';

-- Update Macro Package
UPDATE public.products
SET 
  type = 'digital',
  metadata = jsonb_build_object(
    'category', 'nutrition',
    'format', 'PDF',
    'features', ARRAY[
      'Comprehensive macro guide',
      'Meal planning templates',
      'Food database access',
      'Calculation spreadsheets',
      'Nutrition tips'
    ]
  )
WHERE id = '4068f1ae-b207-4c18-afa2-2e594e0b73d5';