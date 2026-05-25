-- Migration: Fix IDOR vulnerability in orders table
-- Date: 2026-05-25
-- Description: Remove dangerous all-access policies that allowed any authenticated user
--              to update/delete any order. Proper user-scoped policies are already in place.

-- Remove dangerous policies that granted unrestricted access
DROP POLICY IF EXISTS "Orders: all access" ON public.orders;
DROP POLICY IF EXISTS "orders_all_access" ON public.orders;

-- Remove duplicate policies (cleanup)
DROP POLICY IF EXISTS "orders_own_read" ON public.orders;
DROP POLICY IF EXISTS "orders_own_insert" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;

-- Note: The following secure policies remain active:
-- 1. "Orders: own read" - Users can SELECT only their orders (auth.uid() = user_id)
-- 2. "Orders: own insert" - Users can INSERT orders as themselves (auth.uid() = user_id)
-- 3. "Orders: own update" - Users can UPDATE only their orders (auth.uid() = user_id)
-- 4. "Orders: admin update" - Admins can UPDATE any order (profiles.role = 'admin')

-- Security verification query (uncomment to test):
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'orders';
