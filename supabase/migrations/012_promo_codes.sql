-- ============================================================
-- GISENYI GADGETS — PROMO CODES TABLE
-- Run in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code         TEXT NOT NULL UNIQUE,
  discount_type  TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  is_active    BOOLEAN NOT NULL DEFAULT true,
  max_uses     INTEGER,
  uses_count   INTEGER NOT NULL DEFAULT 0,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: only authenticated users can read active codes (for validation)
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active promo codes" ON public.promo_codes;
CREATE POLICY "Anyone can read active promo codes"
  ON public.promo_codes FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

DROP POLICY IF EXISTS "Only admins can manage promo codes" ON public.promo_codes;
CREATE POLICY "Only admins can manage promo codes"
  ON public.promo_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed the three existing promo codes (previously hardcoded in client)
INSERT INTO public.promo_codes (code, discount_type, discount_value, is_active) VALUES
  ('GADGET10',  'percent', 10,   true),
  ('WELCOME20', 'percent', 20,   true),
  ('GISENYI',   'fixed',   5000, true)
ON CONFLICT (code) DO NOTHING;
