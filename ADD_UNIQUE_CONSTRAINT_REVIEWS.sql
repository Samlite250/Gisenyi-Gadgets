-- Add unique constraint to prevent duplicate reviews per user per product
-- Run this in Supabase SQL Editor

-- First, remove any duplicate reviews (keep the most recent one)
DELETE FROM reviews a
USING reviews b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.product_id = b.product_id;

-- Add unique constraint
ALTER TABLE reviews
ADD CONSTRAINT reviews_user_product_unique
UNIQUE (user_id, product_id);

-- Add comment
COMMENT ON CONSTRAINT reviews_user_product_unique ON reviews IS 'Ensures each user can only review a product once';
