-- Add new settings if they don't exist
INSERT INTO public.store_settings (key, value)
VALUES 
  ('pix_discount', '0'),
  ('cash_discount', '0'),
  ('pix_api_key', ''),
  ('whatsapp_store', '')
ON CONFLICT (key) DO NOTHING;

-- Grant permissions (standard procedure)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;

-- The coupons table already has min_purchase_amount, just ensuring it allows nulls which it does.
-- Ensuring used_count defaults to 0
ALTER TABLE public.coupons ALTER COLUMN used_count SET DEFAULT 0;
