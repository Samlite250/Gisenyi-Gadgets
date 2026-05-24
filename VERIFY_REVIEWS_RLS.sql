-- Verify and ensure RLS policies are correct for reviews table
-- Run this in Supabase SQL Editor

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'reviews';

-- The policies should already exist. This query just shows them.
-- If you need to recreate them, first run:
-- DROP POLICY "Public can view all reviews" ON reviews;
-- DROP POLICY "Authenticated users can insert own reviews" ON reviews;

-- Then create fresh ones:
-- CREATE POLICY "Public can view all reviews" ON reviews FOR SELECT USING (true);
-- CREATE POLICY "Authenticated users can insert own reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
