-- Allow public access to read files in the store-assets bucket
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Public Access to Store Assets'
    ) THEN
        CREATE POLICY "Public Access to Store Assets"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'store-assets');
    END IF;

    -- Also ensure authenticated users (admin) can upload to it
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated users can upload assets'
    ) THEN
        CREATE POLICY "Authenticated users can upload assets"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'store-assets');
    END IF;

    -- And update/delete
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Authenticated users can update/delete assets'
    ) THEN
        CREATE POLICY "Authenticated users can update/delete assets"
        ON storage.objects FOR ALL
        TO authenticated
        USING (bucket_id = 'store-assets');
    END IF;
END $$;
