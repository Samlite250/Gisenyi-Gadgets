-- ============================================================
-- GISENYI GADGETS — FIX BANNER COLORS (RESTORE ORIGINALS)
-- ============================================================

-- Restore original banner colors
UPDATE public.banners SET color = '#1E293B' WHERE title = 'Big Sale Up to 40% OFF';
UPDATE public.banners SET color = '#475569' WHERE title = 'Apple Days - Save RWF 200K';
UPDATE public.banners SET color = '#64748B' WHERE title = 'Smart Wear Trending';

-- Restore original offer colors
UPDATE public.banners SET color = '#3B82F6' WHERE label = 'Smartphones' AND type = 'offer';
UPDATE public.banners SET color = '#0EA5E9' WHERE label = 'Laptops' AND type = 'offer';
UPDATE public.banners SET color = '#0891B2' WHERE label = 'Headphones' AND type = 'offer';
UPDATE public.banners SET color = '#10B981' WHERE label = 'Smartwatches' AND type = 'offer';
UPDATE public.banners SET color = '#F59E0B' WHERE label = 'Cameras' AND type = 'offer';

-- Update ONLY the 2 new banners with vibrant colors
UPDATE public.banners SET color = '#8B5CF6' WHERE title = 'Gaming Gear Unleashed';      -- Vibrant Purple
UPDATE public.banners SET color = '#EC4899' WHERE title = 'Home Audio Revolution';      -- Hot Pink

-- Log update
DO $$
BEGIN
  RAISE NOTICE 'Restored original colors and updated only new banners';
END $$;
