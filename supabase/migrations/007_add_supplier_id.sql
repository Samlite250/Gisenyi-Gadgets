-- ============================================================
-- GISENYI GADGETS — ADD SUPPLIER ID TO PRODUCTS
-- Run in Supabase SQL Editor
-- ============================================================

-- Add supplier_id column to products table if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- Force Supabase to reload its schema cache so the dashboard API works
NOTIFY pgrst, 'reload schema';
