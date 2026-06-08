-- Permite que usuários autenticados façam upload para o bucket store-assets
CREATE POLICY "Allow public upload to store-assets" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'store-assets');

-- Permite que qualquer pessoa veja os arquivos (necessário para as logos aparecerem na loja)
CREATE POLICY "Allow public view from store-assets" ON storage.objects
FOR SELECT TO anon USING (bucket_id = 'store-assets');

CREATE POLICY "Allow authenticated view from store-assets" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'store-assets');
