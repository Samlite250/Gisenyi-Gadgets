-- ============================================================
-- GISENYI GADGETS — BANNERS TABLE MIGRATION
-- Run in Supabase SQL Editor
-- ============================================================

-- ─── CREATE BANNERS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.banners (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type         TEXT NOT NULL DEFAULT 'banner' CHECK (type IN ('banner', 'offer')),
  title        TEXT,
  subtitle     TEXT,
  button_text  TEXT DEFAULT 'Shop Now',
  discount     TEXT,
  label        TEXT,
  tagline      TEXT,
  color        TEXT DEFAULT '#1E293B',
  image_url    TEXT,
  link_category TEXT,
  sort_order   INTEGER DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Banners: public read" ON public.banners;
DROP POLICY IF EXISTS "Banners: admin all"   ON public.banners;
CREATE POLICY "Banners: public read" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Banners: admin all"   ON public.banners USING (true) WITH CHECK (true);

-- ─── SEED BANNERS (3) ────────────────────────────────────────
-- Note: Seed data moved to 20240101000001_initial_schema.sql to avoid duplicates
-- This migration only creates the table structure and policies

SELECT type, COUNT(*) FROM public.banners GROUP BY type;
