CREATE OR REPLACE FUNCTION public.complete_delivered_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $function$
DECLARE v_order public.orders%ROWTYPE;
DECLARE v_sale_id uuid;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Pedido não encontrado'; END IF;
  IF v_order.status = 'entregue' THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.sales WHERE order_number = v_order.order_number) THEN
    RAISE EXCEPTION 'Este pedido já foi registrado como venda';
  END IF;
  INSERT INTO public.sales (sale_date, customer_name, payment_method, discount, total, notes, order_number)
  VALUES (current_date, (SELECT name FROM public.customers WHERE id = v_order.customer_id), v_order.payment_method, 0, v_order.total, v_order.notes, v_order.order_number)
  RETURNING id INTO v_sale_id;
  INSERT INTO public.sale_items (sale_id, product_id, product_name, quantity, unit_price, unit_cost, size)
  SELECT v_sale_id, oi.product_id, oi.product_name, oi.quantity, oi.price, COALESCE(p.cost, 0), oi.size
  FROM public.order_items oi LEFT JOIN public.products p ON p.id = oi.product_id WHERE oi.order_id = p_order_id;
  UPDATE public.orders SET status = 'entregue' WHERE id = p_order_id;
END;
$function$;
REVOKE ALL ON FUNCTION public.complete_delivered_order(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_delivered_order(uuid) TO authenticated, service_role;