/*
  # Enhanced E-commerce Schema

  1. New Tables
    - `order_statuses` - Track order status changes
    - `order_fulfillment` - Order fulfillment tracking
    - `inventory_transactions` - Detailed inventory tracking
    - `coupons` - Coupon and discount management
    - `abandoned_carts` - Track and recover abandoned carts
    - `shipping_zones` - Shipping rate configuration
    - `tax_rates` - Tax rate configuration
  
  2. Security
    - RLS policies for all new tables
    - Admin-only access for sensitive operations
*/

-- Order Status History
CREATE TABLE IF NOT EXISTS public.order_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Order Fulfillment
CREATE TABLE IF NOT EXISTS public.order_fulfillment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending', 'processing', 'shipped', 'delivered')) DEFAULT 'pending',
  tracking_number text,
  carrier text,
  shipping_method text,
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory Transactions
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  type text CHECK (type IN ('purchase', 'sale', 'adjustment', 'return')) NOT NULL,
  quantity integer NOT NULL,
  reference_id uuid,
  notes text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text CHECK (type IN ('percentage', 'fixed_amount')) NOT NULL,
  value decimal(10,2) NOT NULL,
  min_purchase_amount decimal(10,2),
  max_discount_amount decimal(10,2),
  starts_at timestamptz NOT NULL,
  expires_at timestamptz,
  max_uses integer,
  uses integer DEFAULT 0,
  product_ids uuid[],
  category_ids uuid[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Abandoned Carts
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text,
  items jsonb NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  recovery_email_sent boolean DEFAULT false,
  recovered boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipping Zones
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  countries text[] NOT NULL,
  regions text[],
  postcodes text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipping Methods
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id uuid REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  free_shipping_threshold decimal(10,2),
  min_order_amount decimal(10,2),
  max_order_amount decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tax Rates
CREATE TABLE IF NOT EXISTS public.tax_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  rate decimal(5,2) NOT NULL,
  country text NOT NULL,
  state text,
  city text,
  postcode text,
  priority integer DEFAULT 0,
  compound boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_fulfillment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their order statuses"
  ON public.order_statuses FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their order fulfillment"
  ON public.order_fulfillment FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Everyone can view active coupons"
  ON public.coupons FOR SELECT
  USING (
    expires_at > now() AND
    (max_uses IS NULL OR uses < max_uses)
  );

CREATE POLICY "Users can view their abandoned carts"
  ON public.abandoned_carts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_statuses_order ON public.order_statuses(order_id);
CREATE INDEX IF NOT EXISTS idx_order_fulfillment_order ON public.order_fulfillment(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product ON public.inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON public.inventory_transactions(type);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_expiry ON public.coupons(expires_at) WHERE expires_at > now();
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_user ON public.abandoned_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_zones_countries ON public.shipping_zones USING gin (countries);
CREATE INDEX IF NOT EXISTS idx_tax_rates_location ON public.tax_rates(country, state, city, postcode);

-- Functions
CREATE OR REPLACE FUNCTION public.check_inventory_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if product has enough inventory
  IF EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = NEW.product_id
    AND p.inventory_count < NEW.quantity
  ) THEN
    RAISE EXCEPTION 'Insufficient inventory for product %', NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for inventory checks
DROP TRIGGER IF EXISTS check_inventory_trigger ON public.cart_items;
CREATE TRIGGER check_inventory_trigger
  BEFORE INSERT OR UPDATE ON public.cart_items
  FOR EACH ROW
  EXECUTE FUNCTION public.check_inventory_availability();