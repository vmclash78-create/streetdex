-- Políticas de RLS para o bucket 'store-assets'
-- Permitir que qualquer pessoa visualize os arquivos (leitura pública)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Public Access store-assets'
    ) THEN
        CREATE POLICY "Public Access store-assets" ON storage.objects FOR SELECT USING (bucket_id = 'store-assets');
    END IF;

    -- Permitir que usuários autenticados façam upload
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated Upload store-assets'
    ) THEN
        CREATE POLICY "Authenticated Upload store-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'store-assets' AND auth.role() = 'authenticated');
    END IF;

    -- Permitir que usuários autenticados atualizem seus arquivos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated Update store-assets'
    ) THEN
        CREATE POLICY "Authenticated Update store-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'store-assets' AND auth.role() = 'authenticated');
    END IF;
END $$;
