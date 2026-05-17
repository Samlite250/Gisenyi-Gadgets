-- ============================================================
-- GISENYI GADGETS — ADD PHOTOGRAPHY PROMOTIONAL BANNER
-- ============================================================

-- Add photography-themed promotional banner to the carousel

INSERT INTO public.banners (type, title, subtitle, button_text, color, image_url, sort_order) VALUES
  (
    'banner',
    'Capture Every Moment',
    'Professional cameras & lenses',
    'Explore',
    '#EF4444',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=300',
    6
  );

-- Log banner count
DO $$
DECLARE
  banner_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO banner_count FROM public.banners WHERE type = 'banner';
  RAISE NOTICE 'Total promotional banners: %', banner_count;
END $$;
