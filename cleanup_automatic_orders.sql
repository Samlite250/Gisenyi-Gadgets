-- ============================================================
-- CLEANUP: Remove Automatic Payment Orders and Transactions
-- WARNING: This will permanently delete data!
-- ============================================================

-- Step 1: View automatic orders before deletion (for verification)
SELECT
  id,
  order_number,
  user_id,
  payment_type,
  payment_status,
  total_amount,
  created_at
FROM orders
WHERE payment_type = 'automatic'
ORDER BY created_at DESC;

-- Step 2: Delete transactions linked to automatic orders
-- This uses a subquery to find all transactions where the order has payment_type = 'automatic'
DELETE FROM transactions
WHERE order_id IN (
  SELECT id
  FROM orders
  WHERE payment_type = 'automatic'
);

-- Step 3: Delete the automatic orders themselves
DELETE FROM orders
WHERE payment_type = 'automatic';

-- Step 4: Verify deletion - should return 0 rows
SELECT COUNT(*) as remaining_automatic_orders
FROM orders
WHERE payment_type = 'automatic';

-- Step 5: View remaining orders summary
SELECT
  payment_type,
  payment_status,
  COUNT(*) as count,
  SUM(total_amount) as total_revenue
FROM orders
GROUP BY payment_type, payment_status
ORDER BY payment_type, payment_status;
