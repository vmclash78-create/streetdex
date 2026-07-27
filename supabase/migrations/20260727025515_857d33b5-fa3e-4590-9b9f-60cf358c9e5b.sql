
-- Public read tables (respect existing RLS policies)
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.hero_banners TO anon, authenticated;
GRANT SELECT ON public.store_settings TO anon, authenticated;

-- Auth-only tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_banners TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_costs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sale_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.melhor_envio_auth TO authenticated;

-- Guest storefront needs to insert orders/customers/items via RPC too, but RPC is SECURITY DEFINER.
-- Allow anon to read published order tracking via RPC (already SECURITY DEFINER, no grant needed on tables).

-- service_role full access on everything
GRANT ALL ON public.products, public.hero_banners, public.store_settings, public.orders,
  public.order_items, public.customers, public.coupons, public.expenses, public.product_costs,
  public.sales, public.sale_items, public.profiles, public.user_roles, public.wishlist,
  public.shipments, public.melhor_envio_auth TO service_role;
