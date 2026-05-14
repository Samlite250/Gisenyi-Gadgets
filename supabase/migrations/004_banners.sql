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
CREATE POLICY "Banners: public read" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Banners: admin all"   ON public.banners USING (true) WITH CHECK (true);

-- ─── SEED BANNERS (3) ────────────────────────────────────────
INSERT INTO public.banners (type, title, subtitle, button_text, color, image_url, sort_order) VALUES
  ('banner', 'Big Sale Up to\n40% OFF',   'On all electronics',   'Shop Now',    '#1E293B', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300', 1),
  ('banner', 'Apple Days\nSave RWF 200K', 'MacBooks & iPads',      'Explore',     '#475569', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300', 2),
  ('banner', 'Smart Wear\nTrending',      'Upgrade your style',    'View Deals',  '#64748B', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=300', 3);

-- ─── SEED SPECIAL OFFERS (5) ─────────────────────────────────
INSERT INTO public.banners (type, label, discount, tagline, color, image_url, link_category, sort_order) VALUES
  ('offer', 'Smartphones',  '30% OFF', 'Top picks this week',         '#3B82F6', 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=600',  'smartphones',  1),
  ('offer', 'Laptops',      '20% OFF', 'Work smarter, save more',     '#0EA5E9', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=600',  'laptops',      2),
  ('offer', 'Headphones',   '40% OFF', 'Sound deals today',           '#0891B2', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600',  'headphones',   3),
  ('offer', 'Smartwatches', '25% OFF', 'Style meets tech',            '#10B981', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600',  'smartwatches', 4),
  ('offer', 'Cameras',      '15% OFF', 'Capture every moment',        '#F59E0B', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600',  'cameras',      5);

SELECT type, COUNT(*) FROM public.banners GROUP BY type;
