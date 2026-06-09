-- O comando de criação de bucket deve ser feito via ferramenta específica, mas as políticas são via migração.
-- Como não posso criar o bucket diretamente aqui via SQL (é desencorajado/não suportado em alguns contextos Lovable),
-- vou garantir que as políticas existam para o bucket 'store-assets'.

-- Se o bucket não existir, ele deve ser criado pela ferramenta de storage.
-- Aqui definimos as políticas de RLS para o bucket store-assets.

DO $$
BEGIN
    -- Política para permitir leitura pública de objetos no bucket store-assets
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Public Access store-assets'
    ) THEN
        CREATE POLICY "Public Access store-assets" ON storage.objects FOR SELECT USING (bucket_id = 'store-assets');
    END IF;

    -- Política para permitir upload por usuários autenticados (ou anon para facilitar no dev, mas idealmente autenticado)
    -- Para este projeto, como o admin usa autenticação Supabase, permitimos 'authenticated'.
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated Upload store-assets'
    ) THEN
        CREATE POLICY "Authenticated Upload store-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'store-assets');
    END IF;

    -- Política para permitir update/delete
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated Update store-assets'
    ) THEN
        CREATE POLICY "Authenticated Update store-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'store-assets');
    END IF;
END $$;
