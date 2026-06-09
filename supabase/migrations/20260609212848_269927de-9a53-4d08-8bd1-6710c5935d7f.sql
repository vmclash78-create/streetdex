-- Políticas para o bucket 'store-assets'
-- 1. Permitir leitura pública (SELECT)
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
END $$;

-- 2. Permitir inserção para usuários autenticados (INSERT)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated Insert store-assets'
    ) THEN
        CREATE POLICY "Authenticated Insert store-assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'store-assets' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- 3. Permitir atualização para usuários autenticados (UPDATE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated Update store-assets'
    ) THEN
        CREATE POLICY "Authenticated Update store-assets" ON storage.objects FOR UPDATE USING (bucket_id = 'store-assets' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- 4. Permitir exclusão para usuários autenticados (DELETE)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated Delete store-assets'
    ) THEN
        CREATE POLICY "Authenticated Delete store-assets" ON storage.objects FOR DELETE USING (bucket_id = 'store-assets' AND auth.role() = 'authenticated');
    END IF;
END $$;
