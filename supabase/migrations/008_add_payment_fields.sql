-- ============================================================
-- ADD MISSING PAYMENT FIELDS TO ORDERS TABLE
-- Ensures mobile app, admin dashboard, and database are synchronized
-- ============================================================

-- Add payment_type field (manual vs automatic)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_type TEXT
CHECK (payment_type IN ('manual', 'automatic', 'cash'));

-- Add manual payment fields for proof of payment uploads
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS manual_payment_screenshot TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS manual_payment_phone TEXT;

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS manual_payment_names TEXT;

-- Add timestamp for when admin reviews manual payment
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS manual_payment_reviewed_at TIMESTAMPTZ;

-- Add promo code field
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS promo_code TEXT;

-- Add discount amount field
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0;

-- Add total_amount field (alias for total, used by some queries)
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,2);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_type ON orders(payment_type);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Update existing orders to set payment_type based on payment_method
UPDATE orders
SET payment_type = CASE
  WHEN payment_method = 'cash' THEN 'cash'
  WHEN payment_method IN ('momo', 'mtn', 'airtel', 'card') THEN 'automatic'
  ELSE 'manual'
END
WHERE payment_type IS NULL;

-- Copy total to total_amount for consistency
UPDATE orders
SET total_amount = total
WHERE total_amount IS NULL;

-- Verify the migration
SELECT
  'Orders by payment type' as info,
  payment_type,
  COUNT(*) as count,
  SUM(total) as revenue
FROM orders
GROUP BY payment_type
ORDER BY payment_type;

SELECT
  'Manual payments pending review' as info,
  COUNT(*) as count
FROM orders
WHERE payment_type = 'manual'
  AND payment_status = 'unpaid'
  AND manual_payment_screenshot IS NOT NULL
  AND manual_payment_reviewed_at IS NULL;
