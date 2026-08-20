-- Garantir acesso de leitura para a tabela products para o público (anon) e autenticados
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- Garantir acesso de leitura para store_settings
GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;

-- Acesso à função has_role (usada pelo hook useAuth)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon;

-- Recriar política de visualização pública para produtos
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
TO anon, authenticated 
USING (status = 'active');

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
