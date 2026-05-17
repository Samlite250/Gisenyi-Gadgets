-- ============================================================
-- GISENYI GADGETS — RESTORE CANON BANNER
-- ============================================================

-- Remove the generic photography banner
DELETE FROM public.banners WHERE title = 'Capture Every Moment';

-- Restore the original Canon EOS 5D Mark IV banner
INSERT INTO public.banners (type, title, label, button_text, color, image_url, sort_order) VALUES
  (
    'banner',
    'Canon EOS 5D Mark IV',
    'PHOTOGRAPHY',
    'Shop Now',
    '#1E293B',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=300',
    1
  );

-- Update sort orders to put Canon banner first
UPDATE public.banners SET sort_order = 2 WHERE title = 'Big Sale Up to 40% OFF';
UPDATE public.banners SET sort_order = 3 WHERE title = 'Apple Days - Save RWF 200K';
UPDATE public.banners SET sort_order = 4 WHERE title = 'Smart Wear Trending';
UPDATE public.banners SET sort_order = 5 WHERE title = 'Gaming Gear Unleashed';
UPDATE public.banners SET sort_order = 6 WHERE title = 'Home Audio Revolution';

-- Log banner count
DO $$
DECLARE
  banner_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO banner_count FROM public.banners WHERE type = 'banner';
  RAISE NOTICE 'Total promotional banners: %', banner_count;
END $$;
