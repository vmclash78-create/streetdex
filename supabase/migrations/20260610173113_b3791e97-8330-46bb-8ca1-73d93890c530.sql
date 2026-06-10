-- 1. Revoke Public Execute from Security Definer functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.create_storefront_order(text, text, text, numeric, text, text, text, text, text, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_storefront_order(text, text, text, numeric, text, text, text, text, text, text, text, text, jsonb) TO anon, authenticated, service_role;

-- 2. Fix "RLS Policy Always True" for wishlist
DROP POLICY IF EXISTS "Anyone can add to wishlist" ON public.wishlist;
CREATE POLICY "Anyone can add to wishlist" ON public.wishlist 
FOR INSERT TO anon, authenticated 
WITH CHECK (customer_phone IS NOT NULL AND customer_name IS NOT NULL);

-- 3. Ensure search_path on remaining functions
ALTER FUNCTION public.update_coupons_updated_at_column() SET search_path = public;
