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

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated All Access store-assets'
    ) THEN
        CREATE POLICY "Authenticated All Access store-assets" ON storage.objects FOR ALL USING (bucket_id = 'store-assets');
    END IF;
END $$;