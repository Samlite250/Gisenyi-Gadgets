-- ============================================================
-- FIX ADMIN PAYMENT SETTINGS PERMISSIONS
-- Run this if you get 400 error when toggling payment settings
-- ============================================================

-- Step 1: Verify settings table exists
SELECT
  'Settings table exists' as status,
  COUNT(*) as row_count
FROM settings;

-- Step 2: Check your admin user role
-- Replace 'your-email@example.com' with your actual admin email
SELECT
  'Admin user check' as status,
  id,
  email,
  raw_user_meta_data->>'full_name' as name
FROM auth.users
WHERE email = 'samuelndayambaje250@gmail.com';  -- Update this email

-- Step 3: Check if admin role is set in profiles
SELECT
  'Profile role check' as status,
  id,
  full_name,
  email,
  role,
  is_active
FROM profiles
WHERE email = 'samuelndayambaje250@gmail.com';  -- Update this email

-- Step 4: Set admin role if missing
-- This ensures you can update settings
UPDATE profiles
SET role = 'admin'
WHERE email = 'samuelndayambaje250@gmail.com'  -- Update this email
  AND (role IS NULL OR role != 'admin');

-- Step 5: Verify the payment_methods setting exists
SELECT
  'Payment settings check' as status,
  key,
  value,
  updated_at
FROM settings
WHERE key = 'payment_methods';

-- Step 6: If setting doesn't exist, create it
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

-- Step 7: Test update permission (this should work after Step 4)
-- This simulates what the admin dashboard does
UPDATE settings
SET value = jsonb_set(value, '{manual_enabled}', 'true'::jsonb)
WHERE key = 'payment_methods';

-- Step 8: Final verification
SELECT
  'Final check - All good!' as status,
  key,
  value,
  updated_at,
  updated_by
FROM settings
WHERE key = 'payment_methods';
