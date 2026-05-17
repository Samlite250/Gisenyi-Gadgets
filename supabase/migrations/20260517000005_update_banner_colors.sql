-- ============================================================
-- GISENYI GADGETS — UPDATE BANNER COLORS
-- ============================================================

-- Update all banners with vibrant, eye-catching colors

-- Promotional Banners (type = 'banner')
UPDATE public.banners SET color = '#3B82F6' WHERE title = 'Big Sale Up to 40% OFF';           -- Vibrant Blue
UPDATE public.banners SET color = '#8B5CF6' WHERE title = 'Apple Days - Save RWF 200K';      -- Electric Purple
UPDATE public.banners SET color = '#10B981' WHERE title = 'Smart Wear Trending';              -- Fresh Emerald
UPDATE public.banners SET color = '#F97316' WHERE title = 'Gaming Gear Unleashed';            -- Bold Orange
UPDATE public.banners SET color = '#EC4899' WHERE title = 'Home Audio Revolution';            -- Vivid Pink

-- Special Offers (type = 'offer') - Keep existing vibrant colors but ensure consistency
UPDATE public.banners SET color = '#3B82F6' WHERE label = 'Smartphones' AND type = 'offer';   -- Bright Blue
UPDATE public.banners SET color = '#0EA5E9' WHERE label = 'Laptops' AND type = 'offer';       -- Sky Blue
UPDATE public.banners SET color = '#14B8A6' WHERE label = 'Headphones' AND type = 'offer';    -- Teal
UPDATE public.banners SET color = '#10B981' WHERE label = 'Smartwatches' AND type = 'offer';  -- Emerald
UPDATE public.banners SET color = '#F59E0B' WHERE label = 'Cameras' AND type = 'offer';       -- Amber

-- Log update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count FROM public.banners;
  RAISE NOTICE 'Updated % banners with vibrant colors', updated_count;
END $$;
