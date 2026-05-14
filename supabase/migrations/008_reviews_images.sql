-- ============================================================
-- GISENYI GADGETS — ADD IMAGE URL TO REVIEWS
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Add image_url to reviews table
ALTER TABLE public.reviews 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create Storage Bucket for review images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies for review-images
CREATE POLICY "Review Images: Public Read"
ON storage.objects FOR SELECT
USING (bucket_id = 'review-images');

CREATE POLICY "Review Images: Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'review-images');

-- Note: We assume reviews table already has INSERT policies for authenticated users.
-- Let's ensure authenticated users can insert reviews
CREATE POLICY "Reviews: Auth Insert"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Force Supabase to reload its schema cache
NOTIFY pgrst, 'reload schema';
