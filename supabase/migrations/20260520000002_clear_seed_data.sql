-- ============================================================
-- CLEAR SEED/TEST DATA - PREPARE FOR PRODUCTION
-- Run this ONLY ONCE when ready to start with real orders
-- ============================================================

-- WARNING: This will delete all test orders and reset suppliers
-- Make sure you understand what this does before running!

BEGIN;

-- ─── STEP 1: Clear Order Items ─────────────────────────────
-- Delete all items from test orders first (foreign key dependency)
DELETE FROM public.order_items
WHERE order_id IN (
  SELECT id FROM public.orders WHERE order_number LIKE 'SEED%'
);

-- ─── STEP 2: Clear Orders ──────────────────────────────────
-- Delete all test/seed orders
DELETE FROM public.orders WHERE order_number LIKE 'SEED%';

-- If you want to delete ALL orders (including any real ones), uncomment:
-- DELETE FROM public.order_items;
-- DELETE FROM public.orders;

-- ─── STEP 3: Reset Suppliers ───────────────────────────────
-- Reset supplier sales to zero
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='total_sold') THEN
    UPDATE public.suppliers SET total_sold = 0;
  END IF;
END $$;

-- Or delete test suppliers completely (uncomment if needed):
-- DELETE FROM public.suppliers WHERE name IN ('Jean-Pierre Habimana', 'Marie Claire Uwimana');

-- ─── STEP 4: Clear Notifications ───────────────────────────
-- Delete test notifications (optional)
DELETE FROM public.notifications WHERE title LIKE '%demo%' OR title LIKE '%test%';

-- ─── STEP 5: Clear Reviews ─────────────────────────────────
-- Delete test reviews (optional)
DELETE FROM public.reviews WHERE content LIKE '%test%' OR content LIKE '%demo%';

-- ─── STEP 6: Clear Wishlists ───────────────────────────────
-- Clear test wishlists (optional - only if you want fresh start)
-- DELETE FROM public.wishlists;

COMMIT;

-- ─── VERIFICATION ───────────────────────────────────────────
-- Run these queries to verify cleanup:

SELECT 'Orders' as table_name, COUNT(*) as count FROM public.orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM public.order_items
UNION ALL
SELECT 'Suppliers', COUNT(*) FROM public.suppliers
UNION ALL
SELECT 'Notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'Reviews', COUNT(*) FROM public.reviews;

-- Check suppliers reset
SELECT name, total_sold FROM public.suppliers;

-- ============================================================
-- AFTER RUNNING THIS SCRIPT:
-- ============================================================
-- 1. Dashboard should show RWF 0 for all financial metrics
-- 2. Products and categories remain unchanged (keep inventory)
-- 3. Users/customers remain unchanged
-- 4. System is ready for real production orders
-- ============================================================
