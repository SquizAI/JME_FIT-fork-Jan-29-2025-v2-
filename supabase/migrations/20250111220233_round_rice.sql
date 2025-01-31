-- Drop existing policy first
DROP POLICY IF EXISTS "Users can manage their payment methods" ON public.saved_payment_methods;

-- Create wallet table
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  balance decimal(10,2) DEFAULT 0.00,
  currency text DEFAULT 'USD',
  status text CHECK (status IN ('active', 'frozen', 'closed')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wallet transactions table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES public.wallets(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  type text CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund')) NOT NULL,
  status text CHECK (status IN ('pending', 'completed', 'failed', 'reversed')) DEFAULT 'pending',
  reference_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create saved payment methods table
CREATE TABLE IF NOT EXISTS public.saved_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text CHECK (type IN ('card', 'paypal', 'apple_pay', 'google_pay')) NOT NULL,
  provider_payment_id text,
  last_four text,
  expiry_month integer,
  expiry_year integer,
  card_brand text,
  is_default boolean DEFAULT false,
  billing_address jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_payment_methods ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own wallet"
  ON public.wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their wallet transactions"
  ON public.wallet_transactions FOR SELECT
  TO authenticated
  USING (
    wallet_id IN (
      SELECT id FROM public.wallets WHERE user_id = auth.uid()
    )
  );

-- Create new policy with a different name
CREATE POLICY "Users can manage payment methods"
  ON public.saved_payment_methods FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON public.saved_payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON public.saved_payment_methods(user_id) WHERE is_default = true;

-- Function to ensure only one default payment method
CREATE OR REPLACE FUNCTION public.ensure_single_default_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE public.saved_payment_methods
    SET is_default = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for default payment method
DROP TRIGGER IF EXISTS ensure_single_default_payment_trigger ON public.saved_payment_methods;
CREATE TRIGGER ensure_single_default_payment_trigger
  BEFORE INSERT OR UPDATE ON public.saved_payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_default_payment();