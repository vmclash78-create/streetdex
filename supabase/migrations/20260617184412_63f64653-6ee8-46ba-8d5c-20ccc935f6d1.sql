DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read store-assets'
  ) THEN
    CREATE POLICY "Public read store-assets" ON storage.objects FOR SELECT USING (bucket_id = 'store-assets');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated upload store-assets'
  ) THEN
    CREATE POLICY "Authenticated upload store-assets" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'store-assets');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated update store-assets'
  ) THEN
    CREATE POLICY "Authenticated update store-assets" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'store-assets');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='storage' AND tablename='objects' AND policyname='Authenticated delete store-assets'
  ) THEN
    CREATE POLICY "Authenticated delete store-assets" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'store-assets');
  END IF;
END $$;