# Bug Fixes Report - Gisenyi Gadgets

**Date:** May 17, 2026  
**Status:** ✅ All bugs fixed

---

## Summary

Found and fixed **5 critical bugs** across the mobile app, admin dashboard, and database schema.

---

## Bugs Fixed

### 🔴 Bug #1: Undefined Variable in CartContext
**File:** `mobile-app/src/context/CartContext.js:119`  
**Severity:** Critical - App Crash  
**Issue:** The `applyPromoCode` function referenced `subtotal` before it was defined. This variable is computed later at line 145, causing a `ReferenceError` when applying promo codes.

**Fix:** Calculate `currentSubtotal` locally within the function scope before using it.

```javascript
// Calculate current subtotal
const currentSubtotal = cartItems.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);
```

---

### 🔴 Bug #2: Missing `promo_codes` Table in Main Schema
**File:** `supabase/schema.sql`  
**Severity:** Critical - Database Error  
**Issue:** The mobile app's `CartContext` queries the `promo_codes` table, but it was only defined in a separate migration file (`migrations/012_promo_codes.sql`), not in the main schema. This causes SQL errors when users run the main schema.

**Fix:** Added the complete `promo_codes` table definition, RLS policies, and seed data to the main `schema.sql` file:
- Table creation with proper constraints
- RLS policies for public read (active codes only) and admin management
- Seed data for default promo codes (GADGET10, WELCOME20, GISENYI)

---

### 🔴 Bug #3: Missing Style Definition in CheckoutScreen
**File:** `mobile-app/src/screens/CheckoutScreen.js:250`  
**Severity:** Medium - UI Crash  
**Issue:** The component referenced `styles.totalAmount` which didn't exist in the StyleSheet, causing a runtime error when rendering the total price.

**Fix:** Added the missing style definition:

```javascript
totalAmount: { fontSize: 22, fontWeight: '900', color: COLORS.primaryBlue }
```

---

### 🔴 Bug #4: Exposed API Keys in .env.example
**File:** `mobile-app/.env.example`  
**Severity:** Critical - Security Vulnerability  
**Issue:** The `.env.example` file contained actual Supabase API credentials instead of placeholder text. This exposes production database credentials to anyone who clones the repository.

**Fix:** Replaced real credentials with placeholders:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

### 🔴 Bug #5: Hardcoded API Keys in Source Code
**Files:**  
- `mobile-app/src/services/supabase.js`  
- `admin-dashboard/src/services/supabase.js`

**Severity:** Critical - Security Vulnerability  
**Issue:** Both mobile app and admin dashboard had Supabase credentials hardcoded in the source files instead of reading from environment variables. This:
- Exposes credentials in version control
- Makes it impossible to use different credentials for dev/staging/production
- Creates security risks if the repository is public

**Fix:** 
1. Updated both files to read from environment variables
2. Added validation to throw clear errors if environment variables are missing
3. Removed all hardcoded credentials

**Mobile App:**
```javascript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please create a .env file...'
  );
}
```

**Admin Dashboard:**
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please create a .env file...'
  );
}
```

---

## Impact Assessment

| Bug | Impact Before Fix | Impact After Fix |
|-----|-------------------|------------------|
| #1 - Undefined Variable | App crashes when applying promo codes | ✅ Promo codes work correctly |
| #2 - Missing Table | Database setup fails, app can't query promo codes | ✅ Complete database schema works out of the box |
| #3 - Missing Style | App crashes on checkout screen | ✅ Checkout screen renders correctly |
| #4 - Exposed Keys | Production credentials visible in repository | ✅ Only placeholders in example file |
| #5 - Hardcoded Keys | Credentials in version control, security risk | ✅ Environment-based configuration |

---

## Testing Recommendations

1. **Promo Code Testing:**
   - Test applying valid promo codes (GADGET10, WELCOME20, GISENYI)
   - Test invalid/expired codes
   - Verify discount calculations

2. **Database Setup:**
   - Run the updated `schema.sql` in a fresh Supabase project
   - Verify all tables including `promo_codes` are created
   - Test RLS policies

3. **Checkout Flow:**
   - Complete a full checkout with various totals
   - Verify total amount displays correctly
   - Test with and without promo codes

4. **Environment Configuration:**
   - Create `.env` files in both mobile-app and admin-dashboard
   - Verify clear error messages if env vars are missing
   - Test with different Supabase projects

---

## Security Improvements

✅ **Removed hardcoded credentials from 2 files**  
✅ **Protected production API keys**  
✅ **Implemented proper environment variable validation**  
✅ **Sanitized example files**

---

## Next Steps

1. **Create `.env` files** for both mobile-app and admin-dashboard with your actual Supabase credentials
2. **Re-run database schema** if you already ran it without the promo_codes table
3. **Test promo code functionality** end-to-end
4. **Consider rotating API keys** that were previously exposed in the repository

---

**All bugs have been successfully fixed and are ready for testing!** 🎉
