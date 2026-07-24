
-- Revoke redeem_coupon from public roles (should only run server-side/admin)
REVOKE EXECUTE ON FUNCTION public.redeem_coupon(uuid) FROM anon, authenticated, PUBLIC;

-- Drop broad public listing policy on store-assets. Public URLs still work
-- because the bucket is marked public and served without RLS.
DROP POLICY IF EXISTS "Public read store-assets" ON storage.objects;

-- Add explicit admin-only SELECT policy on product_costs so it does not rely
-- solely on default-deny (defense in depth).
CREATE POLICY "Admins read product costs"
  ON public.product_costs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
