-- ============================================================
-- GISENYI GADGETS — PAYMENT METHOD MIGRATION
-- Run this in your Supabase SQL Editor to allow the new
-- payment methods (mtn, airtel, bank, crypto) alongside
-- the existing ones.
-- ============================================================

-- Drop old constraint
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;

-- Add updated constraint with all supported payment methods
ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('momo', 'mtn', 'airtel', 'bank', 'crypto', 'card', 'cash'));

-- Optional: update the comment/documentation
COMMENT ON COLUMN public.orders.payment_method IS
  'Payment method used: momo (generic), mtn, airtel, bank, crypto, card, cash';
