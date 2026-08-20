-- Habilitar replicação em tempo real para a tabela products
ALTER TABLE public.products REPLICA IDENTITY FULL;

-- Garantir que o Realtime está habilitado para a tabela products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
  ) THEN
    -- Tenta adicionar se a publicação existir
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
    END IF;
  END IF;
END $$;
