-- Database Optimization and Integrity Migration

-- 1. MISSING INDEXES ON FREQUENTLY QUERIED COLUMNS
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON public.products (sort_order);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON public.sales (sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON public.sales (payment_method);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items (sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items (product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_customer_phone ON public.wishlist (customer_phone);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON public.wishlist (product_id);

-- 2. CASCADING DELETES
ALTER TABLE public.order_items 
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey,
ADD CONSTRAINT order_items_order_id_fkey 
  FOREIGN KEY (order_id) 
  REFERENCES public.orders(id) 
  ON DELETE CASCADE;

ALTER TABLE public.sale_items 
DROP CONSTRAINT IF EXISTS sale_items_sale_id_fkey,
ADD CONSTRAINT sale_items_sale_id_fkey 
  FOREIGN KEY (sale_id) 
  REFERENCES public.sales(id) 
  ON DELETE CASCADE;

ALTER TABLE public.shipments 
DROP CONSTRAINT IF EXISTS shipments_order_id_fkey,
ADD CONSTRAINT shipments_order_id_fkey 
  FOREIGN KEY (order_id) 
  REFERENCES public.orders(id) 
  ON DELETE CASCADE;

-- 3. DATA TYPES AND INTEGRITY
ALTER TABLE public.products ADD CONSTRAINT products_price_check CHECK (price >= 0);
ALTER TABLE public.orders ADD CONSTRAINT orders_total_check CHECK (total >= 0);

-- 4. GRANTS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sale_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist TO authenticated;

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.orders TO anon;
GRANT SELECT ON public.order_items TO anon;
GRANT SELECT ON public.wishlist TO anon;

GRANT ALL ON public.products TO service_role;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;
GRANT ALL ON public.sales TO service_role;
GRANT ALL ON public.sale_items TO service_role;
GRANT ALL ON public.shipments TO service_role;
GRANT ALL ON public.wishlist TO service_role;
