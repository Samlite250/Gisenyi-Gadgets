-- ============================================================
-- GISENYI GADGETS — ADMIN RLS & SUPPLIERS MIGRATION
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. CREATE SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS public.suppliers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  phone           TEXT NOT NULL,
  business_name   TEXT,
  location        TEXT,
  commission_rate NUMERIC(5,2) DEFAULT 15,
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  products_count  INTEGER DEFAULT 0,
  total_sold      NUMERIC(12,2) DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ENABLE RLS ON SUPPLIERS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suppliers: all access" ON public.suppliers USING (true) WITH CHECK (true);

-- 3. FIX ADMIN UPDATE/DELETE POLICIES
-- The admin panel needs INSERT/UPDATE/DELETE access.
-- For this MVP, we allow all operations (the panel is local).
CREATE POLICY "Categories: all access" ON public.categories USING (true) WITH CHECK (true);
CREATE POLICY "Products: all access"   ON public.products   USING (true) WITH CHECK (true);
CREATE POLICY "Orders: all access"     ON public.orders     USING (true) WITH CHECK (true);
CREATE POLICY "Order items: all access" ON public.order_items USING (true) WITH CHECK (true);

-- Seed some initial suppliers for the admin dashboard
INSERT INTO public.suppliers (name, phone, business_name, location, commission_rate, notes, products_count, total_sold)
VALUES 
  ('Jean-Pierre Habimana', '+250 788 123 456', 'JP Electronics', 'Gisenyi Market', 15, 'Supplies iPhones and Samsung phones.', 12, 4200000),
  ('Marie Claire Uwimana', '+250 788 234 567', 'MC Tech Store', 'Rubavu', 20, 'Laptops and tablets.', 7, 8500000)
ON CONFLICT DO NOTHING;
