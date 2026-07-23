
-- 1) COUPONS
DROP POLICY IF EXISTS "Public read active coupons" ON public.coupons;

CREATE OR REPLACE FUNCTION public.validate_coupon(p_code text, p_total numeric)
RETURNS TABLE(id uuid, code text, discount_type text, discount_value numeric, min_purchase_amount numeric, valid boolean, reason text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v public.coupons%ROWTYPE;
BEGIN
  SELECT * INTO v FROM public.coupons WHERE upper(coupons.code) = upper(trim(p_code)) LIMIT 1;
  IF NOT FOUND THEN RETURN QUERY SELECT NULL::uuid, p_code, NULL::text, NULL::numeric, NULL::numeric, false, 'not_found'; RETURN; END IF;
  IF v.status <> 'active' THEN RETURN QUERY SELECT v.id, v.code, v.discount_type, v.discount_value, v.min_purchase_amount, false, 'inactive'; RETURN; END IF;
  IF v.expires_at IS NOT NULL AND v.expires_at < now() THEN RETURN QUERY SELECT v.id, v.code, v.discount_type, v.discount_value, v.min_purchase_amount, false, 'expired'; RETURN; END IF;
  IF v.max_uses IS NOT NULL AND v.used_count >= v.max_uses THEN RETURN QUERY SELECT v.id, v.code, v.discount_type, v.discount_value, v.min_purchase_amount, false, 'limit_reached'; RETURN; END IF;
  IF p_total < v.min_purchase_amount THEN RETURN QUERY SELECT v.id, v.code, v.discount_type, v.discount_value, v.min_purchase_amount, false, 'min_purchase'; RETURN; END IF;
  RETURN QUERY SELECT v.id, v.code, v.discount_type, v.discount_value, v.min_purchase_amount, true, 'ok';
END; $$;

CREATE OR REPLACE FUNCTION public.redeem_coupon(p_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.coupons
     SET used_count = used_count + 1,
         status = CASE WHEN max_uses IS NOT NULL AND used_count + 1 >= max_uses THEN 'inactive' ELSE status END,
         updated_at = now()
   WHERE id = p_id AND status = 'active';
END; $$;

REVOKE ALL ON FUNCTION public.validate_coupon(text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text, numeric) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.redeem_coupon(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(uuid) TO anon, authenticated;

-- 2) STORAGE: remove duplicate SELECT policy on store-assets
DROP POLICY IF EXISTS "Public view store-assets" ON storage.objects;

-- 3) Trigger-only SECURITY DEFINER: revoke public execute
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_coupons_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
