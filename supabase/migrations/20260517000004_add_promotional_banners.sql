-- ============================================================
-- GISENYI GADGETS — ADD PROMOTIONAL BANNERS
-- ============================================================

-- Add 2 new professional promotional banners to enhance the home carousel

INSERT INTO public.banners (type, title, subtitle, button_text, color, image_url, sort_order) VALUES
  (
    'banner',
    'Gaming Gear Unleashed',
    'Controllers, consoles & more',
    'Game On',
    '#7C3AED',
    'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=300',
    4
  ),
  (
    'banner',
    'Home Audio Revolution',
    'Premium speakers & sound systems',
    'Listen Now',
    '#DC2626',
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=300',
    5
  );

-- Log banner count
DO $$
DECLARE
  banner_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO banner_count FROM public.banners WHERE type = 'banner';
  RAISE NOTICE 'Total promotional banners: %', banner_count;
END $$;
