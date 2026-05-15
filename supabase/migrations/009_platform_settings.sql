-- ============================================================
-- GISENYI GADGETS — PLATFORM SETTINGS MIGRATION
-- ============================================================

-- 1. CREATE PLATFORM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key         TEXT PRIMARY KEY,
    value       JSONB,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ENABLE RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES
DROP POLICY IF EXISTS "platform_settings: public read" ON public.platform_settings;
CREATE POLICY "platform_settings: public read" ON public.platform_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "platform_settings: admin all" ON public.platform_settings;
CREATE POLICY "platform_settings: admin all" ON public.platform_settings USING (true) WITH CHECK (true);

-- 4. SEED INITIAL SETTINGS (JSON strings must be double-quoted)
INSERT INTO public.platform_settings (key, value)
VALUES 
  ('platformName', '"Gisenyi Gadgets"'),
  ('currency', '"RWF"'),
  ('supportEmail', '"support@gisenyigadgets.rw"'),
  ('mtnInstructions', '"1. Dial *182#\n2. Transfer to: +250 78X XXX XXX\n3. Keep TxID for confirmation."'),
  ('airtelInstructions', '"1. Dial *500#\n2. Transfer to: +250 73X XXX XXX\n3. Keep TxID for confirmation."'),
  ('bankInstructions', '"1. Transfer to Bank of Kigali (BK)\n2. Account: 000 XXXX XXX\n3. Use Order # as reference."'),
  ('cryptoInstructions', '"1. Send USDT (TRC-20) to: TXXXXXX...\n2. Take a screenshot of the TxID."'),
  ('standardShippingFee', '"2000"'),
  ('expressShippingFee', '"5000"'),
  ('freeShippingThreshold', '"50000"'),
  ('lowStockThreshold', '"5"')
ON CONFLICT (key) DO NOTHING;
