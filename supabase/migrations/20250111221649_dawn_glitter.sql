-- Add inventory tracking functionality
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  type text CHECK (type IN ('adjustment', 'sale', 'restock', 'return')) NOT NULL,
  quantity integer NOT NULL,
  previous_count integer NOT NULL,
  new_count integer NOT NULL,
  reference_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admin users can manage inventory transactions"
  ON public.inventory_transactions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product 
  ON public.inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type 
  ON public.inventory_transactions(type);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date 
  ON public.inventory_transactions(created_at);

-- Function to update product inventory
CREATE OR REPLACE FUNCTION public.update_product_inventory()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate inventory won't go negative
  IF (
    TG_OP = 'INSERT' AND 
    NEW.type IN ('sale', 'adjustment') AND
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = NEW.product_id
      AND inventory_count + NEW.quantity < 0
    )
  ) THEN
    RAISE EXCEPTION 'Insufficient inventory';
  END IF;

  -- Update product inventory count
  UPDATE public.products
  SET 
    inventory_count = inventory_count + NEW.quantity,
    updated_at = now()
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

-- Create trigger for inventory updates
DROP TRIGGER IF EXISTS update_product_inventory_trigger ON public.inventory_transactions;
CREATE TRIGGER update_product_inventory_trigger
  AFTER INSERT ON public.inventory_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_inventory();