
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- ===== store_settings =====
DROP POLICY IF EXISTS "Anyone can view settings" ON public.store_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.store_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.store_settings;

CREATE POLICY "Anyone can view settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.store_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert settings" ON public.store_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== products =====
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING ((status = 'active') OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== hero_banners =====
DROP POLICY IF EXISTS "Anyone can view active banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Admins can update banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Admins can insert banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON public.hero_banners;

CREATE POLICY "Anyone can view active banners" ON public.hero_banners FOR SELECT USING ((active = true) OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'::app_role)));
CREATE POLICY "Admins can update banners" ON public.hero_banners FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert banners" ON public.hero_banners FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete banners" ON public.hero_banners FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== sales =====
DROP POLICY IF EXISTS "Admins can manage sales" ON public.sales;
DROP POLICY IF EXISTS "Admins can insert sales" ON public.sales;

CREATE POLICY "Admins can manage sales" ON public.sales FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert sales" ON public.sales FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== sale_items =====
DROP POLICY IF EXISTS "Admins can manage sale_items" ON public.sale_items;
DROP POLICY IF EXISTS "Admins can insert sale_items" ON public.sale_items;

CREATE POLICY "Admins can manage sale_items" ON public.sale_items FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert sale_items" ON public.sale_items FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== expenses =====
DROP POLICY IF EXISTS "Admins can manage expenses" ON public.expenses;
DROP POLICY IF EXISTS "Admins can insert expenses" ON public.expenses;

CREATE POLICY "Admins can manage expenses" ON public.expenses FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert expenses" ON public.expenses FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ===== profiles =====
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- ===== user_roles =====
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::app_role));
