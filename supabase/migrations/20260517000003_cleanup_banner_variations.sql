-- ============================================================
-- GISENYI GADGETS — CLEANUP BANNER VARIATIONS
-- ============================================================

-- The previous cleanup kept different text variations as separate records.
-- This migration normalizes similar banners and keeps only one version of each.

-- Remove banners with slight text variations (keep the cleaner versions without \n)
DELETE FROM public.banners
WHERE (
  -- Remove banners with \n in title (keep the clean version)
  title LIKE '%\n%'
  OR
  -- Remove the Canon banner if it's a duplicate or test
  (type = 'banner' AND title LIKE '%Canon%')
);

-- Log final banner count
DO $$
DECLARE
  banner_count INTEGER;
  offer_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO banner_count FROM public.banners WHERE type = 'banner';
  SELECT COUNT(*) INTO offer_count FROM public.banners WHERE type = 'offer';

  RAISE NOTICE 'Final banner counts:';
  RAISE NOTICE '  - Banners: %', banner_count;
  RAISE NOTICE '  - Offers: %', offer_count;
  RAISE NOTICE '  - Total: %', banner_count + offer_count;
END $$;
