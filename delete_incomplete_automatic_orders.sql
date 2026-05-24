-- ============================================================
-- DELETE INCOMPLETE AUTOMATIC PAYMENT ORDERS
-- Permanently deletes automatic orders EXCEPT completed ones
-- WARNING: This permanently deletes data!
-- ============================================================

-- Step 1: View what will be KEPT (completed automatic orders)
SELECT
  id,
  order_number,
  user_id,
  status,
  payment_status,
  total_amount,
  created_at
FROM orders
WHERE payment_type = 'automatic'
  AND (status = 'completed' OR status = 'delivered')
ORDER BY created_at DESC;

-- Step 2: View what will be DELETED (non-completed automatic orders)
SELECT
  id,
  order_number,
  user_id,
  status,
  payment_status,
  total_amount,
  created_at
FROM orders
WHERE payment_type = 'automatic'
  AND status NOT IN ('completed', 'delivered')
ORDER BY created_at DESC;

-- Step 3: Count before deletion
SELECT
  'WILL BE KEPT' as action,
  COUNT(*) as count,
  SUM(total_amount) as total_revenue
FROM orders
WHERE payment_type = 'automatic'
  AND (status = 'completed' OR status = 'delivered')
UNION ALL
SELECT
  'WILL BE DELETED' as action,
  COUNT(*) as count,
  SUM(total_amount) as total_revenue
FROM orders
WHERE payment_type = 'automatic'
  AND status NOT IN ('completed', 'delivered');

-- ============================================================
-- DANGER ZONE: Permanent Deletion Below
-- ============================================================

-- Step 4: Delete transactions for incomplete automatic orders
DELETE FROM transactions
WHERE order_id IN (
  SELECT id
  FROM orders
  WHERE payment_type = 'automatic'
    AND status NOT IN ('completed', 'delivered')
);

-- Step 5: Delete incomplete automatic orders
DELETE FROM orders
WHERE payment_type = 'automatic'
  AND status NOT IN ('completed', 'delivered');

-- Step 6: Verify deletion
SELECT
  'Remaining automatic orders' as description,
  COUNT(*) as count,
  SUM(total_amount) as total_revenue
FROM orders
WHERE payment_type = 'automatic';

-- Step 7: View all remaining orders by type and status
SELECT
  payment_type,
  status,
  payment_status,
  COUNT(*) as count,
  SUM(total_amount) as total_revenue
FROM orders
GROUP BY payment_type, status, payment_status
ORDER BY payment_type, status;
