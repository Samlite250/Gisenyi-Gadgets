-- ============================================================
-- GISENYI GADGETS — STORAGE SETUP
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Create a public bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public to view images
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 3. Allow authenticated users (Admins/Vendors) to upload images
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- 4. Allow authenticated users to update/delete their own uploads (basic policy)
CREATE POLICY "Authenticated Update/Delete Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
