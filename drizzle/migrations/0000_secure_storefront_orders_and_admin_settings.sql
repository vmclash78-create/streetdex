REVOKE ALL ON TABLE public.orders FROM anon;
REVOKE ALL ON TABLE public.order_items FROM anon;
REVOKE ALL ON TABLE public.customers FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.customers TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.order_items TO service_role;
GRANT ALL ON TABLE public.customers TO service_role;

DROP POLICY IF EXISTS "Public can view orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;
DROP POLICY IF EXISTS "Public can view order_items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can view order_items" ON public.order_items;

DROP POLICY IF EXISTS "Admins can manage settings" ON public.store_settings;
DROP POLICY IF EXISTS "Admin can manage settings" ON public.store_settings;
CREATE POLICY "Admins can insert settings"
ON public.store_settings FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update settings"
ON public.store_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete settings"
ON public.store_settings FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.create_storefront_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text DEFAULT NULL::text,
  p_total numeric DEFAULT 0,
  p_payment_method text DEFAULT 'pix'::text,
  p_address_cep text DEFAULT NULL::text,
  p_address_street text DEFAULT NULL::text,
  p_address_number text DEFAULT NULL::text,
  p_address_neighborhood text DEFAULT NULL::text,
  p_address_city text DEFAULT NULL::text,
  p_address_complement text DEFAULT NULL::text,
  p_notes text DEFAULT NULL::text,
  p_items jsonb DEFAULT '[]'::jsonb,
  p_coupon_code text DEFAULT NULL::text
)
RETURNS TABLE(id uuid, order_number integer, total numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number integer;
  v_item jsonb;
  v_product public.products%ROWTYPE;
  v_status_val public.order_status;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_payment_discount numeric := 0;
  v_shipping numeric := 0;
  v_total numeric := 0;
  v_qty integer;
  v_size text;
  v_coupon public.coupons%ROWTYPE;
  v_setting text;
  v_all_free boolean := true;
  v_allowed_shipping boolean := false;
  v_shipping_config jsonb;
BEGIN
  IF p_customer_name IS NULL OR length(trim(p_customer_name)) < 2 THEN
    RAISE EXCEPTION 'Nome do cliente inválido';
  END IF;
  IF p_customer_phone IS NULL OR length(regexp_replace(p_customer_phone, '\D', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'Telefone inválido';
  END IF;
  IF p_payment_method NOT IN ('pix', 'dinheiro', 'cartao') THEN
    RAISE EXCEPTION 'Forma de pagamento inválida';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 30 THEN
    RAISE EXCEPTION 'O pedido deve conter entre 1 e 30 itens';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    IF NOT (v_item ? 'product_id') OR COALESCE(v_item->>'product_id', '') = '' THEN
      RAISE EXCEPTION 'Produto inválido';
    END IF;
    BEGIN
      v_qty := (v_item->>'quantity')::integer;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Quantidade inválida';
    END;
    IF v_qty < 1 OR v_qty > 20 THEN
      RAISE EXCEPTION 'Quantidade inválida';
    END IF;

    SELECT * INTO v_product
    FROM public.products
    WHERE products.id = (v_item->>'product_id')::uuid
      AND products.status = 'active'
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produto indisponível';
    END IF;
    IF COALESCE(v_product.stock, 0) < v_qty THEN
      RAISE EXCEPTION 'Estoque insuficiente para %', v_product.name;
    END IF;
    v_size := NULLIF(trim(v_item->>'size'), '');
    IF v_size IS NULL OR NOT (v_size = ANY(v_product.sizes)) THEN
      RAISE EXCEPTION 'Tamanho inválido para %', v_product.name;
    END IF;

    v_subtotal := v_subtotal + (v_product.price * v_qty);
    v_all_free := v_all_free AND COALESCE(v_product.free_shipping, false);
  END LOOP;

  IF NULLIF(trim(COALESCE(p_coupon_code, '')), '') IS NOT NULL THEN
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE upper(code) = upper(trim(p_coupon_code))
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at >= now())
      AND (max_uses IS NULL OR used_count < max_uses)
      AND v_subtotal >= min_purchase_amount
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Cupom inválido ou indisponível';
    END IF;
    IF v_coupon.discount_type = 'percentage' THEN
      v_discount := LEAST(v_subtotal, v_subtotal * v_coupon.discount_value / 100);
    ELSE
      v_discount := LEAST(v_subtotal, v_coupon.discount_value);
    END IF;
  END IF;

  SELECT value INTO v_setting FROM public.store_settings WHERE key = CASE WHEN p_payment_method = 'pix' THEN 'pix_discount' WHEN p_payment_method = 'dinheiro' THEN 'cash_discount' ELSE '' END LIMIT 1;
  IF p_payment_method IN ('pix', 'dinheiro') THEN
    v_payment_discount := GREATEST(0, LEAST(100, COALESCE(NULLIF(regexp_replace(COALESCE(v_setting, '0'), '[^0-9.]', '', 'g'), '')::numeric, 0)));
  END IF;

  v_total := (v_subtotal - v_discount) * (1 - v_payment_discount / 100);
  v_shipping := GREATEST(0, round(COALESCE(p_total, v_total) - v_total, 2));

  IF v_all_free AND v_shipping = 0 THEN
    v_allowed_shipping := true;
  END IF;
  SELECT value::jsonb INTO v_shipping_config FROM public.store_settings WHERE key = 'shipping_config' LIMIT 1;
  IF v_shipping_config IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM jsonb_each(v_shipping_config) region,
      LATERAL (VALUES ((region.value->>'pac_price')::numeric), ((region.value->>'sedex_price')::numeric)) prices(price)
      WHERE prices.price = v_shipping
    ) INTO v_allowed_shipping;
  ELSE
    v_allowed_shipping := v_allowed_shipping OR v_shipping IN (19.9, 34.9, 24.9, 39.9, 29.9, 49.9, 27.9, 44.9, 34.9, 59.9);
  END IF;
  IF NOT v_allowed_shipping THEN
    RAISE EXCEPTION 'Valor de frete inválido';
  END IF;
  v_total := round(v_total + v_shipping, 2);
  IF v_total <= 0 THEN
    RAISE EXCEPTION 'Total do pedido inválido';
  END IF;

  v_status_val := CASE WHEN p_payment_method = 'pix' THEN 'aguardando_pagamento'::public.order_status ELSE 'preparando'::public.order_status END;

  SELECT customers.id INTO v_customer_id
  FROM public.customers
  WHERE regexp_replace(customers.phone, '\D', '', 'g') = regexp_replace(p_customer_phone, '\D', '', 'g')
  ORDER BY customers.created_at LIMIT 1;

  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers (name, phone, email)
    VALUES (trim(p_customer_name), trim(p_customer_phone), NULLIF(trim(p_customer_email), ''))
    RETURNING customers.id INTO v_customer_id;
  ELSE
    UPDATE public.customers SET name = trim(p_customer_name), email = NULLIF(trim(p_customer_email), '') WHERE customers.id = v_customer_id;
  END IF;

  INSERT INTO public.orders (customer_id, total, payment_method, address_cep, address_street, address_number, address_neighborhood, address_city, address_complement, notes, status)
  VALUES (v_customer_id, v_total, p_payment_method, NULLIF(trim(p_address_cep), ''), NULLIF(trim(p_address_street), ''), NULLIF(trim(p_address_number), ''), NULLIF(trim(p_address_neighborhood), ''), NULLIF(trim(p_address_city), ''), NULLIF(trim(p_address_complement), ''), NULLIF(trim(p_notes), ''), v_status_val)
  RETURNING orders.id, orders.order_number INTO v_order_id, v_order_number;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::integer;
    SELECT * INTO v_product FROM public.products WHERE products.id = (v_item->>'product_id')::uuid FOR UPDATE;
    INSERT INTO public.order_items (order_id, product_name, product_img, size, quantity, price, product_id)
    VALUES (v_order_id, v_product.name, v_product.img, NULLIF(trim(v_item->>'size'), ''), v_qty, v_product.price, v_product.id);
    UPDATE public.products SET stock = stock - v_qty WHERE products.id = v_product.id;
  END LOOP;

  IF v_coupon.id IS NOT NULL THEN
    UPDATE public.coupons
    SET used_count = used_count + 1,
        status = CASE WHEN max_uses IS NOT NULL AND used_count + 1 >= max_uses THEN 'inactive' ELSE status END,
        updated_at = now()
    WHERE coupons.id = v_coupon.id;
  END IF;

  RETURN QUERY SELECT v_order_id, v_order_number, v_total;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_storefront_order(text,text,text,numeric,text,text,text,text,text,text,text,text,jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_storefront_order(text,text,text,numeric,text,text,text,text,text,text,text,text,jsonb,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_storefront_order(text,text,text,numeric,text,text,text,text,text,text,text,text,jsonb,text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.find_storefront_order(p_order_number integer, p_customer_phone text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $function$
  SELECT o.id
  FROM public.orders o
  JOIN public.customers c ON c.id = o.customer_id
  WHERE o.order_number = p_order_number
    AND right(regexp_replace(c.phone, '\D', '', 'g'), 8) = right(regexp_replace(p_customer_phone, '\D', '', 'g'), 8)
  LIMIT 1
$function$;
REVOKE ALL ON FUNCTION public.find_storefront_order(integer,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_storefront_order(integer,text) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_order_for_tracking(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_order_for_tracking(uuid) TO anon, authenticated, service_role;