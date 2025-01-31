-- Add required products if they don't exist
INSERT INTO public.products (id, name, description, price, status, slug)
VALUES 
  ('2dc36526-c95c-4331-889c-2118f222e8a9', 'App Workouts Only - Self-Led', 'Monthly subscription to app workouts', 29.99, 'active', 'app-workouts'),
  ('81bac6bd-384e-4882-baa1-99a1532ab7c4', 'Nutrition Only', '12-week nutrition coaching program', 199.99, 'active', 'nutrition-only'),
  ('44b0b0a5-3a5a-4b0e-b643-bf5247956365', 'Plus Membership', 'Complete transformation package', 349.99, 'active', 'plus-membership')
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  status = EXCLUDED.status,
  slug = EXCLUDED.slug;