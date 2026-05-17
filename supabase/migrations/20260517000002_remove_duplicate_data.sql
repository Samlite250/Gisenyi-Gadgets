-- ============================================================
-- GISENYI GADGETS — REMOVE DUPLICATE DATA
-- ============================================================

-- Remove duplicate banners (keep only the first occurrence of each)
WITH duplicates AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY type,
      COALESCE(title, ''),
      COALESCE(subtitle, ''),
      COALESCE(label, ''),
      COALESCE(discount, '')
      ORDER BY created_at
    ) AS rn
  FROM public.banners
)
DELETE FROM public.banners
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Remove duplicate suppliers (keep only the first occurrence of each)
WITH duplicates AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY name, phone
      ORDER BY created_at
    ) AS rn
  FROM public.suppliers
)
DELETE FROM public.suppliers
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Log cleanup results
DO $$
DECLARE
  banner_count INTEGER;
  supplier_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO banner_count FROM public.banners;
  SELECT COUNT(*) INTO supplier_count FROM public.suppliers;

  RAISE NOTICE 'Data cleanup complete. Remaining records:';
  RAISE NOTICE '  - Banners: %', banner_count;
  RAISE NOTICE '  - Suppliers: %', supplier_count;
END $$;
