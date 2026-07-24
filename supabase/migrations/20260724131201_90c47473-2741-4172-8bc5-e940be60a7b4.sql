
-- 1) Novos valores de status do pedido
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'etiqueta_gerada' BEFORE 'enviado';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'postado' AFTER 'enviado';
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'em_transito' AFTER 'postado';

-- 2) Tabela shipments
CREATE TABLE public.shipments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  carrier         TEXT NOT NULL DEFAULT 'melhor_envio',
  carrier_service TEXT,
  carrier_order_id TEXT,
  tracking_code   TEXT,
  label_url       TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','purchased','generated','posted','in_transit','delivered','cancelled','failed')),
  shipping_cost   NUMERIC(10,2),
  raw_response    JSONB NOT NULL DEFAULT '{}'::jsonb,
  posted_at       TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipments_order   ON public.shipments(order_id);
CREATE INDEX idx_shipments_tracking ON public.shipments(tracking_code);
CREATE INDEX idx_shipments_status  ON public.shipments(status);

-- 3) GRANTS (obrigatório para o Data API enxergar)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shipments TO authenticated;
GRANT ALL ON public.shipments TO service_role;

-- 4) RLS: só admin
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shipments_admin_all" ON public.shipments
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5) Trigger updated_at
CREATE TRIGGER trg_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
