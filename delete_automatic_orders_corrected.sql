-- ============================================================
-- DELETE AUTOMATIC PAYMENT ORDERS (CORRECTED FOR ACTUAL SCHEMA)
-- Works with your database schema (uses payment_method, not payment_type)
-- Deletes momo, card, mtn, airtel orders (except completed/delivered)
-- ============================================================

-- Step 1: View what will be KEPT (completed/delivered automatic orders)
SELECT
  id,
  order_number,
  user_id,
  payment_method,
  status,
  payment_status,
  total,
  created_at
FROM orders
WHERE payment_method IN ('momo', 'card', 'mtn', 'airtel')
  AND (status = 'completed' OR status = 'delivered')
ORDER BY created_at DESC;

-- Step 2: View what will be DELETED
SELECT
  id,
  order_number,
  user_id,
  payment_method,
  status,
  payment_status,
  total,
  created_at
FROM orders
WHERE payment_method IN ('momo', 'card', 'mtn', 'airtel')
  AND status NOT IN ('completed', 'delivered')
ORDER BY created_at DESC;

-- Step 3: Count before deletion
SELECT
  'WILL BE KEPT' as action,
  COUNT(*) as count,
  SUM(total) as total_revenue
FROM orders
WHERE payment_method IN ('momo', 'card', 'mtn', 'airtel')
  AND (status = 'completed' OR status = 'delivered')
UNION ALL
SELECT
  'WILL BE DELETED' as action,
  COUNT(*) as count,
  SUM(total) as total_revenue
FROM orders
WHERE payment_method IN ('momo', 'card', 'mtn', 'airtel')
  AND status NOT IN ('completed', 'delivered');

-- ============================================================
-- DANGER ZONE: Permanent Deletion Below
-- ============================================================

-- Step 4: Delete orders (no transactions table exists)
DELETE FROM orders
WHERE payment_method IN ('momo', 'card', 'mtn', 'airtel')
  AND status NOT IN ('completed', 'delivered');

-- Step 5: Verify deletion
SELECT
  'Remaining automatic orders' as description,
  payment_method,
  status,
  COUNT(*) as count,
  SUM(total) as total_revenue
FROM orders
WHERE payment_method IN ('momo', 'card', 'mtn', 'airtel')
GROUP BY payment_method, status;

-- Step 6: View all remaining orders summary
SELECT
  payment_method,
  status,
  payment_status,
  COUNT(*) as count,
  SUM(total) as total_revenue
FROM orders
GROUP BY payment_method, status, payment_status
ORDER BY payment_method, status;
