-- We don't need to create the table, it already exists.
-- We just need to ensure the keys exist if they don't already.
-- The store_settings table uses key/value pairs.

INSERT INTO public.store_settings (key, value)
VALUES 
  ('card_fee', '0'),
  ('pix_discount', '2')
ON CONFLICT (key) DO NOTHING;

GRANT ALL ON public.store_settings TO service_role;
GRANT SELECT, UPDATE, INSERT ON public.store_settings TO authenticated;
GRANT SELECT ON public.store_settings TO anon;
