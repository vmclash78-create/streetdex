ALTER FUNCTION public.create_storefront_order(text,text,text,numeric,text,text,text,text,text,text,text,text,jsonb) SET search_path = public;

GRANT EXECUTE ON FUNCTION public.create_storefront_order(text,text,text,numeric,text,text,text,text,text,text,text,text,jsonb) TO anon, authenticated, service_role;