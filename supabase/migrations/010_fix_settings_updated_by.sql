-- ============================================================
-- FIX SETTINGS TABLE - Add missing updated_by column
-- Run this if you get "record 'new' has no field 'updated_by'" error
-- ============================================================

-- Add updated_by column if it doesn't exist
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Recreate the trigger function to handle the column gracefully
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Only set updated_by if column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'settings' AND column_name = 'updated_by'
  ) THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS settings_updated_at ON settings;
CREATE TRIGGER settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION update_settings_timestamp();

-- Verify the column was added
SELECT
  'Column check' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'settings'
  AND column_name = 'updated_by';

-- Show current settings state
SELECT
  'Current settings' as status,
  id,
  key,
  value,
  updated_at,
  updated_by
FROM settings
WHERE key = 'payment_methods';
