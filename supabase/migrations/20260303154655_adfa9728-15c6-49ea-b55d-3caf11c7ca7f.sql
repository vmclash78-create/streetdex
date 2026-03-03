
-- Add cost column to products for margin calculation
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cost numeric DEFAULT 0;

-- Sales table
CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text,
  payment_method text NOT NULL DEFAULT 'dinheiro',
  discount numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sales" ON public.sales
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert sales" ON public.sales
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Sale items table
CREATE TABLE public.sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id),
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  unit_cost numeric DEFAULT 0,
  size text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sale_items" ON public.sale_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert sale_items" ON public.sale_items
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Expenses table
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  amount numeric NOT NULL,
  category text DEFAULT 'outros',
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage expenses" ON public.expenses
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert expenses" ON public.expenses
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
