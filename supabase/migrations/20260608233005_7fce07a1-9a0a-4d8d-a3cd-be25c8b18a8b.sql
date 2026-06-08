-- Drop the old function first to avoid parameter issues
DROP FUNCTION IF EXISTS public.create_storefront_order(text,text,text,numeric,text,text,text,text,text,text,text,text,jsonb);

-- Recreate the storefront order creation function
CREATE OR REPLACE FUNCTION public.create_storefront_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_total numeric,
  p_payment_method text,
  p_address_cep text DEFAULT '',
  p_address_street text DEFAULT '',
  p_address_number text DEFAULT '',
  p_address_neighborhood text DEFAULT '',
  p_address_city text DEFAULT '',
  p_address_complement text DEFAULT '',
  p_notes text DEFAULT '',
  p_items jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number int;
  v_item jsonb;
BEGIN
  -- Validate required fields
  IF length(trim(p_customer_name)) < 2 THEN
    RAISE EXCEPTION 'Nome do cliente deve ter pelo menos 2 caracteres';
  END IF;
  IF length(trim(p_customer_phone)) < 10 THEN
    RAISE EXCEPTION 'Telefone deve ter pelo menos 10 dígitos';
  END IF;
  IF p_total <= 0 THEN
    RAISE EXCEPTION 'Total do pedido deve ser maior que zero';
  END IF;
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Pedido deve conter pelo menos um item';
  END IF;

  -- Ensure customers has a unique constraint on phone
  -- We'll try to find an existing customer or create a new one
  SELECT id INTO v_customer_id FROM customers WHERE phone = trim(p_customer_phone) LIMIT 1;
  
  IF v_customer_id IS NULL THEN
    INSERT INTO customers (name, phone, email)
    VALUES (trim(p_customer_name), trim(p_customer_phone), NULLIF(trim(p_customer_email), ''))
    RETURNING id INTO v_customer_id;
  ELSE
    UPDATE customers SET 
      name = trim(p_customer_name),
      email = NULLIF(trim(p_customer_email), '')
    WHERE id = v_customer_id;
  END IF;

  -- Insert order
  INSERT INTO orders (
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
    'aguardando_pagamento'
  )
  RETURNING id, order_number INTO v_order_id, v_order_number;

  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, product_name, product_img, size, quantity, price, product_id)
    VALUES (
      v_order_id,
      v_item->>'product_name',
      v_item->>'product_img',
      v_item->>'size',
      COALESCE((v_item->>'quantity')::int, 1),
      COALESCE((v_item->>'price')::numeric, 0),
      (NULLIF(v_item->>'product_id', '')::uuid)
    );
  END LOOP;

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$;

-- Ensure proper grants
GRANT EXECUTE ON FUNCTION public.create_storefront_order TO anon;
GRANT EXECUTE ON FUNCTION public.create_storefront_order TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_storefront_order TO service_role;
