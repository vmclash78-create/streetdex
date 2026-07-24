
CREATE TABLE public.melhor_envio_auth (
  id              INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  environment     TEXT NOT NULL DEFAULT 'sandbox' CHECK (environment IN ('sandbox','production')),
  client_id       TEXT,
  client_secret   TEXT,
  redirect_uri    TEXT,
  scopes          TEXT NOT NULL DEFAULT 'cart-read cart-write shipping-calculate shipping-cancel shipping-checkout shipping-companies shipping-generate shipping-preview shipping-print shipping-share shipping-tracking ecommerce-shipping transactions-read users-read',
  access_token    TEXT,
  refresh_token   TEXT,
  expires_at      TIMESTAMPTZ,
  connected_email TEXT,
  -- Sender / defaults
  from_name       TEXT,
  from_document   TEXT,
  from_phone      TEXT,
  from_email      TEXT,
  from_zip        TEXT,
  from_address    TEXT,
  from_number     TEXT,
  from_complement TEXT,
  from_district   TEXT,
  from_city       TEXT,
  from_state      TEXT,
  default_weight_kg  NUMERIC(10,3) DEFAULT 0.5,
  default_length_cm  INT DEFAULT 20,
  default_width_cm   INT DEFAULT 15,
  default_height_cm  INT DEFAULT 5,
  default_insurance  NUMERIC(10,2) DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.melhor_envio_auth (id) VALUES (1) ON CONFLICT DO NOTHING;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.melhor_envio_auth TO authenticated;
GRANT ALL ON public.melhor_envio_auth TO service_role;

ALTER TABLE public.melhor_envio_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "me_auth_admin_all" ON public.melhor_envio_auth
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_me_auth_updated_at
  BEFORE UPDATE ON public.melhor_envio_auth
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
