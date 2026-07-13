
-- 1. Storage: keep only admin write policies on store-assets
DROP POLICY IF EXISTS "Authenticated delete store-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update store-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload store-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update/delete assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assets" ON storage.objects;
-- keep "Admins manage store-assets" and public SELECT policies

-- 2. store_settings: allowlist of public keys
DROP POLICY IF EXISTS "Public can view non-sensitive settings" ON public.store_settings;
CREATE POLICY "Public can view safe settings" ON public.store_settings
  FOR SELECT TO anon, authenticated
  USING (key = ANY (ARRAY[
    'store_name','store_description','logo_url','banner_text',
    'whatsapp_number','shipping_info','theme','primary_color',
    'currency','instagram_url','facebook_url','tiktok_url',
    'about_text','contact_email','announcement'
  ]));

-- 3. Remove orders from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.orders;

-- 4. Wishlist: drop public insert policy
DROP POLICY IF EXISTS "Anyone can add to wishlist" ON public.wishlist;

-- 5. Restrict SECURITY DEFINER internal helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
