
-- Add 'superfrete_config' to the allowed keys for public viewing
-- and ensure authenticated users can manage it.
DROP POLICY IF EXISTS "Admins can manage settings" ON public.store_settings;
CREATE POLICY "Admins can manage settings"
ON public.store_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view safe settings" ON public.store_settings;
CREATE POLICY "Public can view safe settings"
ON public.store_settings
FOR SELECT
TO anon, authenticated
USING (
  key = ANY (ARRAY[
    'store_name', 'store_description', 'logo_url', 'logo_url_dark', 'banner_text', 
    'whatsapp_number', 'shipping_info', 'theme', 'primary_color', 'currency', 
    'instagram_url', 'facebook_url', 'tiktok_url', 'about_text', 'contact_email', 
    'announcement', 'announcement_text', 'whatsapp', 'whatsapp_store', 
    'pix_discount', 'cash_discount', 'coupon_code', 'coupon_discount',
    'superfrete_config'
  ])
);

GRANT ALL ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
GRANT SELECT ON public.store_settings TO anon;
