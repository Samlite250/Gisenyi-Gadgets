-- ============================================================
-- GISENYI GADGETS — STORAGE BUCKETS MIGRATION
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Create the 'product-images' bucket (public so anyone can view the images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'product-images', 
  'product-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create security policies to allow uploads, updates, and deletes
-- (For MVP, we allow public access to upload and manage files. In production, restrict INSERT to authenticated admins)

CREATE POLICY "product_images_select" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "product_images_insert" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product_images_update" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'product-images');

CREATE POLICY "product_images_delete" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'product-images');
