-- Add receipt confirmation columns to orders table
-- Run this in Supabase SQL Editor

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS receipt_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS receipt_confirmed_at TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN orders.receipt_confirmed IS 'Whether customer confirmed receiving the order';
COMMENT ON COLUMN orders.receipt_confirmed_at IS 'Timestamp when customer confirmed receipt';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_receipt_confirmed
ON orders(receipt_confirmed)
WHERE receipt_confirmed = true;
