REVOKE EXECUTE ON FUNCTION public.create_storefront_order(text,text,text,numeric,text,text,text,text,text,text,text,text,jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_order_for_tracking(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_coupon(text,numeric) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.redeem_coupon(uuid) FROM PUBLIC, anon, authenticated;