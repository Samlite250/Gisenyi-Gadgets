-- ============================================================
-- PAYMENT SETTINGS - Admin Control for Payment Methods
-- Allows admins to hide/show automatic payments
-- ============================================================

-- Create settings table for system-wide configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default payment settings
INSERT INTO settings (key, value, description)
VALUES (
  'payment_methods',
  '{
    "automatic_enabled": false,
    "manual_enabled": true,
    "cash_enabled": true
  }'::jsonb,
  'Control which payment methods are visible to users'
)
ON CONFLICT (key) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- RLS Policies for settings table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings (needed for mobile app)
DROP POLICY IF EXISTS "settings_select" ON settings;
CREATE POLICY "settings_select"
ON settings FOR SELECT
TO authenticated, anon
USING (true);

-- Only admins can update settings
DROP POLICY IF EXISTS "settings_update" ON settings;
CREATE POLICY "settings_update"
ON settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Only admins can insert settings
DROP POLICY IF EXISTS "settings_insert" ON settings;
CREATE POLICY "settings_insert"
ON settings FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Function to update settings timestamp
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS settings_updated_at ON settings;
CREATE TRIGGER settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION update_settings_timestamp();

-- Verify the migration
SELECT
  'Payment settings' as info,
  key,
  value,
  description
FROM settings
WHERE key = 'payment_methods';
