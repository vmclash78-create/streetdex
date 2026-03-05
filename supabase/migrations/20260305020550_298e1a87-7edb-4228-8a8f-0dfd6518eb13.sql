
-- 1. Create secure RPC function for storefront order creation (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_storefront_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text DEFAULT '',
  p_total numeric DEFAULT 0,
  p_payment_method text DEFAULT 'pix',
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
SET search_path = public
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

  -- Insert customer
  INSERT INTO customers (name, phone, email)
  VALUES (trim(p_customer_name), trim(p_customer_phone), NULLIF(trim(p_customer_email), ''))
  RETURNING id INTO v_customer_id;

  -- Insert order
  INSERT INTO orders (customer_id, total, payment_method, address_cep, address_street, address_number, address_neighborhood, address_city, address_complement, notes)
  VALUES (
    v_customer_id, p_total, p_payment_method,
    NULLIF(trim(p_address_cep), ''),
    NULLIF(trim(p_address_street), ''),
    NULLIF(trim(p_address_number), ''),
    NULLIF(trim(p_address_neighborhood), ''),
    NULLIF(trim(p_address_city), ''),
    NULLIF(trim(p_address_complement), ''),
    NULLIF(trim(p_notes), '')
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
      NULLIF(v_item->>'product_id', '')::uuid
    );
  END LOOP;

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
END;
$$;

-- 2. Fix customers RLS: remove public read, remove public insert (now handled by RPC)
DROP POLICY IF EXISTS "Anyone can read customers" ON public.customers;
DROP POLICY IF EXISTS "Anyone can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;

CREATE POLICY "Admins full access customers" ON public.customers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Fix orders RLS: remove public insert (handled by RPC), keep public SELECT for tracking
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can read orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;

CREATE POLICY "Public read orders for tracking" ON public.orders
  FOR SELECT USING (true);

CREATE POLICY "Admins manage orders" ON public.orders
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Fix order_items RLS: remove public insert (handled by RPC), keep public SELECT for tracking
DROP POLICY IF EXISTS "Anyone can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can read order_items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage order_items" ON public.order_items;

CREATE POLICY "Public read order_items for tracking" ON public.order_items
  FOR SELECT USING (true);

CREATE POLICY "Admins manage order_items" ON public.order_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
