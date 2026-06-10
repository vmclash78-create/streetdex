DROP FUNCTION IF EXISTS public.create_storefront_order(text,text,text,numeric,text,text,text,text,text,text,text,text,jsonb);

CREATE OR REPLACE FUNCTION public.create_storefront_order(
    p_customer_name text,
    p_customer_phone text,
    p_customer_email text DEFAULT NULL,
    p_total numeric DEFAULT 0,
    p_payment_method text DEFAULT 'pix',
    p_address_cep text DEFAULT NULL,
    p_address_street text DEFAULT NULL,
    p_address_number text DEFAULT NULL,
    p_address_neighborhood text DEFAULT NULL,
    p_address_city text DEFAULT NULL,
    p_address_complement text DEFAULT NULL,
    p_notes text DEFAULT NULL,
    p_items jsonb DEFAULT '[]'::jsonb
)
RETURNS TABLE (id uuid, order_number int)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number int;
  v_item jsonb;
  v_status_val public.order_status;
BEGIN
    -- Determine initial status based on payment method
    IF p_payment_method = 'pix' THEN
      v_status_val := 'aguardando_pagamento'::public.order_status;
    ELSIF p_payment_method = 'dinheiro' THEN
      v_status_val := 'preparando'::public.order_status;
    ELSE
      v_status_val := 'pago'::public.order_status;
    END IF;

    -- Validations
    IF p_customer_name IS NULL OR length(trim(p_customer_name)) < 2 THEN
      RAISE EXCEPTION 'Nome do cliente inválido (mínimo 2 caracteres)';
    END IF;
    IF p_customer_phone IS NULL OR length(trim(p_customer_phone)) < 8 THEN
      RAISE EXCEPTION 'Telefone inválido (mínimo 8 dígitos)';
    END IF;
    IF p_total IS NULL OR p_total <= 0 THEN
      RAISE EXCEPTION 'Total do pedido inválido';
    END IF;

    -- Customer logic
    SELECT c.id INTO v_customer_id FROM public.customers c WHERE c.phone = trim(p_customer_phone) LIMIT 1;
    
    IF v_customer_id IS NULL THEN
      INSERT INTO public.customers (name, phone, email)
      VALUES (trim(p_customer_name), trim(p_customer_phone), NULLIF(trim(p_customer_email), ''))
      RETURNING public.customers.id INTO v_customer_id;
    ELSE
      UPDATE public.customers SET 
        name = trim(p_customer_name),
        email = NULLIF(trim(p_customer_email), '')
      WHERE public.customers.id = v_customer_id;
    END IF;

    -- Order insertion
    INSERT INTO public.orders (
      customer_id, 
      total, 
      payment_method, 
      address_cep, 
      address_street, 
      address_number, 
      address_neighborhood, 
      address_city, 
      address_complement, 
      notes,
      status
    )
    VALUES (
      v_customer_id, 
      p_total, 
      p_payment_method,
      NULLIF(trim(p_address_cep), ''),
      NULLIF(trim(p_address_street), ''),
      NULLIF(trim(p_address_number), ''),
      NULLIF(trim(p_address_neighborhood), ''),
      NULLIF(trim(p_address_city), ''),
      NULLIF(trim(p_address_complement), ''),
      NULLIF(trim(p_notes), ''),
      v_status_val
    )
    RETURNING public.orders.id, public.orders.order_number INTO v_order_id, v_order_number;

    -- Items insertion
    IF p_items IS NOT NULL AND jsonb_array_length(p_items) > 0 THEN
        FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
        LOOP
          INSERT INTO public.order_items (order_id, product_name, product_img, size, quantity, price, product_id)
          VALUES (
            v_order_id,
            COALESCE(v_item->>'product_name', 'Produto'),
            v_item->>'product_img',
            v_item->>'size',
            COALESCE((v_item->>'quantity')::int, 1),
            COALESCE((v_item->>'price')::numeric, 0),
            (CASE WHEN v_item->>'product_id' IS NOT NULL AND v_item->>'product_id' <> '' THEN (v_item->>'product_id')::uuid ELSE NULL END)
          );
        END LOOP;
    ELSE
      RAISE EXCEPTION 'O pedido deve conter pelo menos um item';
    END IF;

    RETURN QUERY SELECT v_order_id, v_order_number;
END;
$$;