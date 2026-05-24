-- ============================================================
-- GISENYI GADGETS — PAYMENT SCREENSHOTS BUCKET
-- Create storage bucket for payment proof uploads
-- ============================================================

-- 1. Create the 'payment-screenshots' bucket (public so admins can view)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-screenshots',
  'payment-screenshots',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create security policies for payment screenshots
-- Allow authenticated users to upload payment proofs
DROP POLICY IF EXISTS "payment_screenshots_select" ON storage.objects;
DROP POLICY IF EXISTS "payment_screenshots_insert" ON storage.objects;
DROP POLICY IF EXISTS "payment_screenshots_update" ON storage.objects;
DROP POLICY IF EXISTS "payment_screenshots_delete" ON storage.objects;

-- Public can view (so admins can check proofs)
CREATE POLICY "payment_screenshots_select"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-screenshots');

-- Authenticated users can upload their payment proofs
CREATE POLICY "payment_screenshots_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-screenshots');

-- Users can update their own payment proofs
CREATE POLICY "payment_screenshots_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-screenshots');

-- Only admins should delete (but allow for now for flexibility)
CREATE POLICY "payment_screenshots_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'payment-screenshots');
