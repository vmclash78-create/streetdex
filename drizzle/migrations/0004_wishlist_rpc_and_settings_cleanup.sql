CREATE OR REPLACE FUNCTION public.add_to_wishlist(p_name text, p_phone text, p_product_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF length(trim(coalesce(p_name,''))) NOT BETWEEN 2 AND 150 THEN RAISE EXCEPTION 'Nome inválido'; END IF;
  IF length(regexp_replace(coalesce(p_phone,''),'\D','','g')) NOT IN (10,11) THEN RAISE EXCEPTION 'Telefone inválido'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE id=p_product_id AND status='active') THEN RAISE EXCEPTION 'Produto indisponível'; END IF;
  IF EXISTS (SELECT 1 FROM public.wishlist WHERE product_id=p_product_id AND regexp_replace(customer_phone,'\D','','g')=regexp_replace(p_phone,'\D','','g')) THEN RETURN; END IF;
  INSERT INTO public.wishlist(customer_name, customer_phone, product_id) VALUES (trim(p_name), trim(p_phone), p_product_id);
END; $$;
REVOKE ALL ON FUNCTION public.add_to_wishlist(text,text,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_to_wishlist(text,text,uuid) TO anon, authenticated;

DROP POLICY IF EXISTS "Public can view safe settings" ON public.store_settings;
CREATE POLICY "Public can view safe settings" ON public.store_settings FOR SELECT TO anon, authenticated
USING (key = ANY (ARRAY['store_name','store_description','logo_url','logo_url_dark','banner_text','whatsapp_number','shipping_info','theme','primary_color','currency','instagram_url','facebook_url','tiktok_url','about_text','contact_email','announcement','announcement_text','whatsapp','whatsapp_store','pix_discount','cash_discount']));