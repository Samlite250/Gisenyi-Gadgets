-- ============================================================
-- SOFT DELETE: Mark Automatic Payment Orders as Cancelled
-- This preserves data but removes them from active views
-- ============================================================

-- Step 1: View automatic orders before update
SELECT
  id,
  order_number,
  user_id,
  payment_type,
  payment_status,
  status,
  total_amount,
  created_at
FROM orders
WHERE payment_type = 'automatic'
ORDER BY created_at DESC;

-- Step 2: Update automatic orders to 'cancelled' status
UPDATE orders
SET
  status = 'cancelled',
  payment_status = 'failed',
  updated_at = NOW()
WHERE payment_type = 'automatic';

-- Step 3: Update corresponding transactions to 'failed' status
UPDATE transactions
SET
  status = 'failed',
  updated_at = NOW()
WHERE order_id IN (
  SELECT id
  FROM orders
  WHERE payment_type = 'automatic'
);

-- Step 4: Verify update
SELECT
  payment_type,
  status,
  payment_status,
  COUNT(*) as count
FROM orders
WHERE payment_type = 'automatic'
GROUP BY payment_type, status, payment_status;

-- Step 5: View remaining active orders summary
SELECT
  payment_type,
  status,
  payment_status,
  COUNT(*) as count,
  SUM(total_amount) as total_revenue
FROM orders
WHERE status != 'cancelled'
GROUP BY payment_type, status, payment_status
ORDER BY payment_type, status;
