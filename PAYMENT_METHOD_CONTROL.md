# Payment Method Visibility Control

## Overview

Admins can now control which payment methods are visible to customers in the mobile app. This allows you to **hide automatic payments until Paypack integration is ready** while keeping manual and cash payments available.

## Features

### Admin Control Panel

**Location:** Admin Dashboard → Settings → Payments tab

Admins can toggle three payment methods:

1. **Automatic Payment (Paypack)** ⚡
   - Instant MTN MoMo and Airtel Money via Paypack
   - Default: **Disabled** (until Paypack is configured)
   - Shows "Automatic" option in mobile checkout

2. **Manual Payment (Screenshot Upload)** 📤
   - Users upload payment screenshots for verification
   - Default: **Enabled** (recommended)
   - Shows "Manual" option for MTN/Airtel in mobile checkout

3. **Cash on Delivery** 💵
   - Pay with cash when order is delivered
   - Default: **Enabled**
   - Shows "Cash on Delivery" option in checkout

### Mobile App Behavior

**Payment Method Selection:**
- Only enabled payment methods appear in the checkout screen
- Cash on Delivery is hidden entirely if disabled
- MoMo payment mode toggle (Automatic/Manual) filters based on settings

**User Experience:**
- Changes take effect immediately (no app restart needed)
- Settings are fetched from database on checkout screen load
- Gracefully defaults to safe settings if fetch fails

## Database Schema

### Settings Table

Created by migration `009_payment_settings.sql`

```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);
```

### Default Configuration

```json
{
  "automatic_enabled": false,
  "manual_enabled": true,
  "cash_enabled": true
}
```

## Setup Instructions

### Step 1: Run Migration

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Contents of supabase/migrations/009_payment_settings.sql
-- Creates settings table with payment_methods configuration
-- See file for full SQL
```

**File:** `supabase/migrations/009_payment_settings.sql`

### Step 2: Verify in Admin Dashboard

1. Log into Admin Dashboard
2. Go to **Settings → Payments**
3. See three toggle switches at the top
4. Default state:
   - ⚡ Automatic Payment: **OFF**
   - 📤 Manual Payment: **ON**
   - 💵 Cash on Delivery: **ON**

### Step 3: Test in Mobile App

1. Open mobile app
2. Add items to cart
3. Go to checkout
4. Verify only enabled payment methods appear
5. For MTN/Airtel, verify only enabled modes (Automatic/Manual) show

## Use Cases

### 🚀 Launch Scenario (No Paypack Yet)

**Goal:** Launch with manual payments only

**Configuration:**
- ⚡ Automatic: **OFF**
- 📤 Manual: **ON**
- 💵 Cash on Delivery: **ON**

**Result:**
- Users see MTN/Airtel with "Manual" mode only
- Users upload payment screenshots
- Admin reviews and approves manually
- Cash on delivery available as alternative

### 🔧 After Paypack Setup

**Goal:** Enable automatic payments

**Configuration:**
- ⚡ Automatic: **ON** ✅
- 📤 Manual: **ON** (keep for flexibility)
- 💵 Cash on Delivery: **ON**

**Result:**
- Users see both "Automatic" and "Manual" modes
- Can choose Paypack instant payment
- Or upload screenshot if preferred
- Admin workload reduced

### 🧪 Testing Phase

**Goal:** Test Paypack without exposing to all users

**Configuration:**
- ⚡ Automatic: **ON** (for testing)
- 📤 Manual: **ON** (fallback)
- 💵 Cash on Delivery: **OFF** (force payment)

**Result:**
- Test users can try Paypack
- Manual upload still available as backup
- No cash orders during testing

## Security

### Row Level Security (RLS)

**Read Access:**
```sql
-- Everyone can read settings (needed for mobile app)
CREATE POLICY "settings_select" ON settings
FOR SELECT TO authenticated, anon
USING (true);
```

**Write Access:**
```sql
-- Only admins can update settings
CREATE POLICY "settings_update" ON settings
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

### Validation

**Mobile App:**
- Fetches settings on checkout load
- Gracefully handles missing settings (defaults to safe mode)
- Filters payment options client-side

**Admin Dashboard:**
- Only admin role can access Settings page
- Changes saved immediately to database
- Toast notifications for success/failure

## Technical Implementation

### Files Modified

**Mobile App:**
- `mobile-app/src/screens/CheckoutScreen.js`
  - Added `paymentSettings` state
  - Fetches from `settings` table
  - Filters payment methods and modes
  - Lines 108-141, 407-420

**Admin Dashboard:**
- `admin-dashboard/src/pages/SettingsPage.jsx`
  - Added payment visibility toggles to Payments tab
  - Real-time updates via `handlePaymentToggle`
  - Lines 77-88, 414-515

**Database:**
- `supabase/migrations/009_payment_settings.sql`
  - Creates `settings` table
  - Inserts default payment configuration
  - Sets up RLS policies

### Code Examples

**Fetch Payment Settings (Mobile):**
```javascript
React.useEffect(() => {
  supabase
    .from('settings')
    .select('value')
    .eq('key', 'payment_methods')
    .single()
    .then(({ data }) => {
      if (data?.value) {
        setPaymentSettings(data.value);
      }
    });
}, []);
```

**Filter Payment Modes:**
```javascript
{[
  { key: 'automatic', label: t('checkout.automatic'), Icon: Zap, enabled: paymentSettings.automatic_enabled },
  { key: 'manual', label: t('checkout.manual'), Icon: Upload, enabled: paymentSettings.manual_enabled },
].filter(mode => mode.enabled).map(({ key, label, Icon }) => (
  <TouchableOpacity onPress={() => setPaymentMode(key)}>
    {/* Mode button UI */}
  </TouchableOpacity>
))}
```

**Admin Toggle (Dashboard):**
```javascript
const handlePaymentToggle = async (key) => {
  const newSettings = { ...paymentSettings, [key]: !paymentSettings[key] };
  setPaymentSettings(newSettings);

  const { error } = await supabase
    .from('settings')
    .update({ value: newSettings })
    .eq('key', 'payment_methods');

  if (error) {
    toast.error('Failed to save');
    setPaymentSettings(paymentSettings); // Revert
  } else {
    toast.success('Settings updated!');
  }
};
```

## Troubleshooting

### Issue: Automatic Payment Always Hidden

**Cause:** Migration 009 not run yet

**Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Run `009_payment_settings.sql`
3. Verify: Check Storage → Tables → `settings` exists
4. Refresh admin dashboard

### Issue: Changes Don't Appear in Mobile App

**Cause:** Mobile app cached old settings

**Fix:**
1. Close and reopen mobile app
2. Navigate away from checkout and back
3. Settings refetch on checkout screen mount

### Issue: Admin Can't Toggle Settings

**Cause:** User doesn't have admin role

**Fix:**
1. Go to Supabase Dashboard → Table Editor → profiles
2. Find admin user
3. Set `role` = `'admin'`
4. Log out and back into admin dashboard

### Issue: All Payment Methods Disabled

**Cause:** Admin accidentally disabled everything

**Fix:**
1. Directly update database:
```sql
UPDATE settings
SET value = '{"automatic_enabled": false, "manual_enabled": true, "cash_enabled": true}'::jsonb
WHERE key = 'payment_methods';
```
2. Refresh admin dashboard

## Future Enhancements

### Planned Features

1. **Per-Method Configuration**
   - Set different receiving accounts per method
   - Custom instructions per payment type
   - Method-specific fees/limits

2. **Scheduled Toggles**
   - Auto-enable automatic at specific date/time
   - Temporary disable during maintenance
   - Flash sale payment restrictions

3. **A/B Testing**
   - Show different methods to different user segments
   - Track conversion rates per method
   - Optimize payment flow

4. **Payment Analytics**
   - Track which methods users choose
   - Success/failure rates per method
   - Revenue by payment type

## Version History

- **v1.0** (2026-05-24) - Initial release
  - Three payment method toggles
  - Admin dashboard integration
  - Mobile app filtering
  - Migration 009 created

## Related Documentation

- `SYSTEM_SYNCHRONIZATION.md` - Complete system architecture
- `PAYMENT_PROOF_FIX.md` - Manual payment setup guide
- `supabase/migrations/009_payment_settings.sql` - Database migration

---

**All payment methods are now under admin control!** 🎛️
