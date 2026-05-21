-- Add RLS policies for reviews table
-- Run this in Supabase SQL Editor

-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all reviews (for product pages)
CREATE POLICY "Anyone can view reviews"
ON reviews
FOR SELECT
USING (true);

-- Policy: Authenticated users can insert their own reviews
CREATE POLICY "Users can insert their own reviews"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own reviews
CREATE POLICY "Users can view their own reviews"
ON reviews
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Note: No UPDATE or DELETE policies - reviews are permanent
-- This enforces the one-time review rule at the database level
