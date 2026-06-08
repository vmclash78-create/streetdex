-- Enable RLS on orders related tables if not already enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Grant permissions to public/anon and authenticated users for the function
GRANT EXECUTE ON FUNCTION public.create_storefront_order TO anon;
GRANT EXECUTE ON FUNCTION public.create_storefront_order TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_storefront_order TO service_role;

-- Grant access to tables for service_role and authenticated users (admins)
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;
GRANT ALL ON public.customers TO service_role;

GRANT SELECT, UPDATE, INSERT, DELETE ON public.orders TO authenticated;
GRANT SELECT, UPDATE, INSERT, DELETE ON public.order_items TO authenticated;
GRANT SELECT, UPDATE, INSERT, DELETE ON public.customers TO authenticated;

-- Policies for authenticated users (Admins) to manage everything
CREATE POLICY "Admins can manage orders" ON public.orders
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage order_items" ON public.order_items
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage customers" ON public.customers
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow public to INSERT but not SELECT/UPDATE/DELETE (for storefront)
-- create_storefront_order is SECURITY DEFINER, so it handles the inserts bypasses RLS if needed, 
-- but we grant it just to be sure.
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.order_items TO anon;
GRANT INSERT ON public.customers TO anon;
