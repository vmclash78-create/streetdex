CREATE POLICY "Public can view checkout settings" ON public.store_settings FOR SELECT TO anon, authenticated USING (key IN ('pix_api_key','shipping_config'));

CREATE OR REPLACE FUNCTION public.create_storefront_order(
  p_customer_name text, p_customer_phone text, p_customer_email text DEFAULT NULL::text,
  p_total numeric DEFAULT 0, p_payment_method text DEFAULT 'pix'::text,
  p_address_cep text DEFAULT NULL::text, p_address_street text DEFAULT NULL::text,
  p_address_number text DEFAULT NULL::text, p_address_neighborhood text DEFAULT NULL::text,
  p_address_city text DEFAULT NULL::text, p_address_complement text DEFAULT NULL::text,
  p_notes text DEFAULT NULL::text, p_items jsonb DEFAULT '[]'::jsonb,
  p_coupon_code text DEFAULT NULL::text, p_shipping_service text DEFAULT 'PAC'::text)
RETURNS TABLE(id uuid, order_number integer, total numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_customer_id uuid; v_order_id uuid; v_order_number integer;
  v_item jsonb; v_product public.products%ROWTYPE;
  v_status_val public.order_status; v_subtotal numeric := 0;
  v_discount numeric := 0; v_payment_discount numeric := 0;
  v_shipping numeric := 0; v_total numeric := 0;
  v_qty integer; v_size text; v_coupon public.coupons%ROWTYPE;
  v_setting text; v_config jsonb; v_region text; v_cep integer;
  v_all_free boolean := true; v_price numeric;
BEGIN
  IF length(trim(coalesce(p_customer_name,''))) < 2 OR length(trim(p_customer_name)) > 150 THEN RAISE EXCEPTION 'Nome inválido'; END IF;
  IF length(regexp_replace(coalesce(p_customer_phone,''), '\D', '', 'g')) NOT IN (10,11) THEN RAISE EXCEPTION 'Telefone inválido'; END IF;
  IF p_payment_method NOT IN ('pix','dinheiro','cartao') THEN RAISE EXCEPTION 'Pagamento inválido'; END IF;
  IF p_shipping_service NOT IN ('PAC','SEDEX') THEN RAISE EXCEPTION 'Frete inválido'; END IF;
  IF length(regexp_replace(coalesce(p_address_cep,''),'\D','','g')) <> 8 OR
     length(trim(coalesce(p_address_street,''))) < 2 OR
     length(trim(coalesce(p_address_number,''))) < 1 OR
     length(trim(coalesce(p_address_neighborhood,''))) < 2 OR
     length(trim(coalesce(p_address_city,''))) < 2 THEN RAISE EXCEPTION 'Endereço incompleto'; END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 30 THEN RAISE EXCEPTION 'Itens inválidos'; END IF;
  IF p_payment_method = 'pix' AND NOT EXISTS (SELECT 1 FROM public.store_settings WHERE key='pix_api_key' AND length(trim(value)) > 0) THEN
    RAISE EXCEPTION 'PIX indisponível';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    IF coalesce(v_item->>'product_id','') = '' OR coalesce(v_item->>'quantity','') !~ '^[0-9]+$' THEN RAISE EXCEPTION 'Produto ou quantidade inválida'; END IF;
    v_qty := (v_item->>'quantity')::integer;
    IF v_qty NOT BETWEEN 1 AND 20 THEN RAISE EXCEPTION 'Quantidade inválida'; END IF;
    SELECT * INTO v_product FROM public.products WHERE products.id=(v_item->>'product_id')::uuid AND products.status='active' FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Produto indisponível'; END IF;
    IF v_product.stock < (SELECT sum((entry.value->>'quantity')::integer) FROM jsonb_array_elements(p_items) entry WHERE entry.value->>'product_id'=v_product.id::text) THEN
      RAISE EXCEPTION 'Estoque insuficiente para %', v_product.name;
    END IF;
    v_size := nullif(trim(v_item->>'size'),'');
    IF v_size IS NULL OR NOT (v_size = ANY(v_product.sizes)) THEN RAISE EXCEPTION 'Tamanho inválido para %',v_product.name; END IF;
    IF v_product.price <= 0 THEN RAISE EXCEPTION 'Preço inválido'; END IF;
    v_subtotal := v_subtotal + v_product.price*v_qty;
    v_all_free := v_all_free AND coalesce(v_product.free_shipping,false);
  END LOOP;

  IF nullif(trim(coalesce(p_coupon_code,'')),'') IS NOT NULL THEN
    SELECT * INTO v_coupon FROM public.coupons WHERE upper(code)=upper(trim(p_coupon_code)) AND status='active'
      AND (expires_at IS NULL OR expires_at>=now()) AND (max_uses IS NULL OR used_count<max_uses)
      AND v_subtotal>=min_purchase_amount FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Cupom inválido ou indisponível'; END IF;
    IF v_coupon.discount_type='percentage' THEN v_discount := least(v_subtotal, v_subtotal*v_coupon.discount_value/100);
    ELSE v_discount := least(v_subtotal,v_coupon.discount_value); END IF;
    v_discount := greatest(0,v_discount);
  END IF;

  SELECT value INTO v_setting FROM public.store_settings WHERE key=CASE WHEN p_payment_method='pix' THEN 'pix_discount' WHEN p_payment_method='dinheiro' THEN 'cash_discount' ELSE '' END LIMIT 1;
  IF coalesce(v_setting,'0') ~ '^[0-9]+(\.[0-9]+)?$' THEN v_payment_discount := least(100, v_setting::numeric); END IF;
  v_total := (v_subtotal-v_discount)*(1-v_payment_discount/100);

  v_cep := regexp_replace(p_address_cep,'\D','','g')::integer;
  v_region := CASE WHEN v_cep BETWEEN 1000000 AND 39999999 THEN 'SE'
                   WHEN v_cep BETWEEN 40000000 AND 65999999 OR v_cep BETWEEN 57000000 AND 59999999 THEN 'NE'
                   WHEN v_cep BETWEEN 66000000 AND 69999999 OR v_cep BETWEEN 76800000 AND 77999999 THEN 'N'
                   WHEN v_cep BETWEEN 70000000 AND 76799999 OR v_cep BETWEEN 78000000 AND 79999999 THEN 'CO'
                   WHEN v_cep BETWEEN 80000000 AND 99999999 THEN 'S' ELSE 'NE' END;
  SELECT value::jsonb INTO v_config FROM public.store_settings WHERE key='shipping_config' LIMIT 1;
  IF p_shipping_service='PAC' AND v_all_free THEN v_shipping := 0;
  ELSE
    v_price := null;
    IF v_config IS NOT NULL THEN
      BEGIN v_price := (v_config->v_region->>(lower(p_shipping_service)||'_price'))::numeric;
      EXCEPTION WHEN invalid_text_representation THEN RAISE EXCEPTION 'Configuração de frete inválida'; END;
    END IF;
    v_shipping := coalesce(v_price,
      CASE v_region WHEN 'NE' THEN CASE p_shipping_service WHEN 'PAC' THEN 19.9 ELSE 34.9 END
       WHEN 'SE' THEN CASE p_shipping_service WHEN 'PAC' THEN 24.9 ELSE 39.9 END
       WHEN 'S' THEN CASE p_shipping_service WHEN 'PAC' THEN 29.9 ELSE 49.9 END
       WHEN 'CO' THEN CASE p_shipping_service WHEN 'PAC' THEN 27.9 ELSE 44.9 END
       ELSE CASE p_shipping_service WHEN 'PAC' THEN 34.9 ELSE 59.9 END END);
  END IF;
  IF v_shipping < 0 THEN RAISE EXCEPTION 'Frete inválido'; END IF;
  v_total := round(v_total+v_shipping,2);
  IF v_total <= 0 THEN RAISE EXCEPTION 'Total inválido'; END IF;

  SELECT customers.id INTO v_customer_id FROM public.customers WHERE regexp_replace(customers.phone,'\D','','g')=regexp_replace(p_customer_phone,'\D','','g') ORDER BY customers.created_at LIMIT 1;
  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers(name,phone,email) VALUES(trim(p_customer_name),trim(p_customer_phone),nullif(trim(p_customer_email),'')) RETURNING customers.id INTO v_customer_id;
  ELSE
    UPDATE public.customers SET name=trim(p_customer_name),email=nullif(trim(p_customer_email),'') WHERE customers.id=v_customer_id;
  END IF;
  v_status_val := CASE WHEN p_payment_method='pix' THEN 'aguardando_pagamento'::public.order_status ELSE 'preparando'::public.order_status END;
  INSERT INTO public.orders(customer_id,total,payment_method,address_cep,address_street,address_number,address_neighborhood,address_city,address_complement,notes,status)
  VALUES(v_customer_id,v_total,p_payment_method,nullif(trim(p_address_cep),''),nullif(trim(p_address_street),''),nullif(trim(p_address_number),''),nullif(trim(p_address_neighborhood),''),nullif(trim(p_address_city),''),nullif(trim(p_address_complement),''),nullif(trim(p_notes),''),v_status_val)
  RETURNING orders.id,orders.order_number INTO v_order_id,v_order_number;
  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::integer;
    SELECT * INTO v_product FROM public.products WHERE products.id=(v_item->>'product_id')::uuid FOR UPDATE;
    INSERT INTO public.order_items(order_id,product_name,product_img,size,quantity,price,product_id)
    VALUES(v_order_id,v_product.name,v_product.img,trim(v_item->>'size'),v_qty,v_product.price,v_product.id);
    UPDATE public.products SET stock=stock-v_qty WHERE products.id=v_product.id;
  END LOOP;
  IF v_coupon.id IS NOT NULL THEN
    UPDATE public.coupons SET used_count=used_count+1,status=CASE WHEN max_uses IS NOT NULL AND used_count+1>=max_uses THEN 'inactive' ELSE status END,updated_at=now() WHERE coupons.id=v_coupon.id;
  END IF;
  RETURN QUERY SELECT v_order_id,v_order_number,v_total;
END;
$function$;
REVOKE ALL ON FUNCTION public.create_storefront_order(text,text,text,numeric,text,text,text,text,text,text,text,text,jsonb,text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_storefront_order(text,text,text,numeric,text,text,text,text,text,text,text,text,jsonb,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_storefront_order(text,text,text,numeric,text,text,text,text,text,text,text,text,jsonb,text,text) TO anon,authenticated,service_role;