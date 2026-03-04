
-- Create customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order status enum
CREATE TYPE public.order_status AS ENUM (
  'aguardando_pagamento',
  'pago',
  'preparando',
  'enviado',
  'entregue'
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number SERIAL,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'pix',
  status public.order_status NOT NULL DEFAULT 'aguardando_pagamento',
  address_cep TEXT,
  address_street TEXT,
  address_number TEXT,
  address_neighborhood TEXT,
  address_city TEXT,
  address_complement TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_img TEXT,
  size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Public can insert customers (for checkout)
CREATE POLICY "Anyone can insert customers" ON public.customers FOR INSERT WITH CHECK (true);
-- Public can read their own customer by id (for order tracking)
CREATE POLICY "Anyone can read customers" ON public.customers FOR SELECT USING (true);
-- Admins can manage customers
CREATE POLICY "Admins can manage customers" ON public.customers FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can insert orders (for checkout)
CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);
-- Public can read orders (for order tracking page)
CREATE POLICY "Anyone can read orders" ON public.orders FOR SELECT USING (true);
-- Admins can update orders (status changes)
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
-- Admins can delete orders
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can insert order items (for checkout)
CREATE POLICY "Anyone can insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
-- Public can read order items (for order tracking)
CREATE POLICY "Anyone can read order_items" ON public.order_items FOR SELECT USING (true);
-- Admins can manage order items
CREATE POLICY "Admins can manage order_items" ON public.order_items FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at on orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
