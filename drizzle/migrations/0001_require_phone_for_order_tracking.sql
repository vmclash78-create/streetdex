CREATE OR REPLACE FUNCTION public.get_order_for_tracking(p_order_id uuid, p_customer_phone text)
RETURNS TABLE(id uuid, order_number integer, status text, total numeric, payment_method text, created_at timestamp with time zone, address_cep text, address_street text, address_number text, address_neighborhood text, address_city text, address_complement text, notes text, order_items jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF length(regexp_replace(coalesce(p_customer_phone,''), '\D', '', 'g')) < 10 THEN RETURN; END IF;
  RETURN QUERY
  SELECT o.id, o.order_number, o.status::text, o.total, o.payment_method, o.created_at,
         o.address_cep, o.address_street, o.address_number, o.address_neighborhood,
         o.address_city, o.address_complement, o.notes,
         COALESCE((SELECT jsonb_agg(jsonb_build_object('id', oi.id, 'product_name', oi.product_name,
           'product_img', oi.product_img, 'size', oi.size, 'quantity', oi.quantity, 'price', oi.price))
           FROM public.order_items oi WHERE oi.order_id=o.id), '[]'::jsonb)
  FROM public.orders o JOIN public.customers c ON c.id=o.customer_id
  WHERE o.id=p_order_id
    AND regexp_replace(c.phone, '\D', '', 'g')=regexp_replace(p_customer_phone, '\D', '', 'g');
END;
$function$;
REVOKE ALL ON FUNCTION public.get_order_for_tracking(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_order_for_tracking(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_for_tracking(uuid,text) TO anon, authenticated, service_role;
CREATE OR REPLACE FUNCTION public.find_storefront_order(p_order_number integer, p_customer_phone text)
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE SET search_path TO 'public'
AS $function$
  SELECT o.id FROM public.orders o JOIN public.customers c ON c.id=o.customer_id
  WHERE o.order_number=p_order_number
    AND length(regexp_replace(coalesce(p_customer_phone,''), '\D', '', 'g')) >= 10
    AND regexp_replace(c.phone, '\D', '', 'g')=regexp_replace(p_customer_phone, '\D', '', 'g')
  LIMIT 1
$function$;