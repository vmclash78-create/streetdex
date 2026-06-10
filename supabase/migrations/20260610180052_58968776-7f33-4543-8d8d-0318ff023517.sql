DROP FUNCTION IF EXISTS public.get_order_for_tracking(uuid);

CREATE OR REPLACE FUNCTION public.get_order_for_tracking(p_order_id UUID)
RETURNS TABLE (
    id UUID,
    order_number INTEGER,
    status TEXT,
    total NUMERIC,
    payment_method TEXT,
    created_at TIMESTAMPTZ,
    address_cep TEXT,
    address_street TEXT,
    address_number TEXT,
    address_neighborhood TEXT,
    address_city TEXT,
    address_complement TEXT,
    notes TEXT,
    order_items JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.order_number,
        o.status::TEXT,
        o.total::NUMERIC,
        o.payment_method::TEXT,
        o.created_at,
        o.address_cep,
        o.address_street,
        o.address_number,
        o.address_neighborhood,
        o.address_city,
        o.address_complement,
        o.notes,
        COALESCE(
            (SELECT jsonb_agg(jsonb_build_object(
                'id', oi.id,
                'product_name', oi.product_name,
                'product_img', oi.product_img,
                'size', oi.size,
                'quantity', oi.quantity,
                'price', oi.price
            ))
            FROM public.order_items oi
            WHERE oi.order_id = o.id),
            '[]'::jsonb
        ) as order_items
    FROM public.orders o
    WHERE o.id = p_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_for_tracking(uuid) TO anon, authenticated, service_role;