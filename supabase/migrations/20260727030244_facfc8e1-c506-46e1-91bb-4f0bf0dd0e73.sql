-- Restaurar acesso público de leitura para tabelas do storefront
-- (estavam sem GRANT algum, causando 401 no site público)

GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT ON public.hero_banners TO anon, authenticated;
GRANT SELECT ON public.store_settings TO anon, authenticated;

-- Autenticados (admin) precisam de CRUD nessas tabelas
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hero_banners TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.store_settings TO authenticated;

GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.hero_banners TO service_role;
GRANT ALL ON public.store_settings TO service_role;