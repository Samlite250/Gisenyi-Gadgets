-- Fix RLS policies for reviews table to allow proper access
-- Run this in Supabase SQL Editor

-- First, drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON reviews;

-- Recreate with proper permissions

-- Policy 1: Allow everyone (including anon) to view all reviews
CREATE POLICY "Public can view all reviews"
ON reviews
FOR SELECT
USING (true);

-- Policy 2: Allow authenticated users to insert their own reviews
CREATE POLICY "Authenticated users can insert own reviews"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
