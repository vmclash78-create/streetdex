-- Garantir que a tabela orders envie todos os dados nas notificações realtime
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Garantir que a tabela esteja na publicação do realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;