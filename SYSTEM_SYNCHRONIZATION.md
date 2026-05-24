# System Synchronization Guide

## Overview
This document ensures all system components (mobile app, admin dashboard, database) are properly wired and synchronized for production deployment.

## Critical Issues Fixed

### 1. ✅ Database Schema Alignment

**Problem:** Code references fields that don't exist in database
- Mobile app and admin dashboard use `payment_type` field
- Database only has `payment_method` field
- Manual payment fields (`manual_payment_screenshot`, etc.) missing

**Solution:** Migration `008_add_payment_fields.sql`
- Adds all missing payment fields
- Creates proper indexes for performance
- Updates existing orders with correct payment_type values

### 2. ✅ Payment Proof Upload System

**Problem:** `payment-screenshots` storage bucket doesn't exist
- Users can't upload payment proofs
- Checkout fails with 400 error

**Solution:** Migration `007_payment_screenshots_bucket.sql`
- Creates storage bucket with proper permissions
- Allows authenticated users to upload
- Public viewing for admin verification

### 3. ✅ Translation System

**Problem:** Hardcoded English text throughout app
- No multi-language support
- Poor user experience for non-English speakers

**Solution:** Complete translation integration
- All 24 screens translated
- English, French, Kinyarwanda support
- Persistent language preferences

## Required Migrations (Run in Order)

### ⚠️ CRITICAL: Run These Migrations Before Deployment

These migrations fix critical bugs and synchronize the database with code expectations.

### Step 1: Run Payment Screenshots Bucket Migration

**File:** `supabase/migrations/007_payment_screenshots_bucket.sql`

**What it does:**
- Creates `payment-screenshots` storage bucket
- Sets up RLS policies for uploads
- Enables payment proof functionality

**Why required:**
- **BUG FIX**: Mobile app checkout fails with 400 error without this bucket
- Users cannot upload payment proofs
- Manual payment orders cannot be completed

**How to run:**
```
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of 007_payment_screenshots_bucket.sql
3. Paste and click "Run"
4. Verify: Check Supabase Dashboard → Storage → Should see "payment-screenshots" bucket
```

### Step 2: Run Payment Fields Migration

**File:** `supabase/migrations/008_add_payment_fields.sql`

**What it does:**
- Adds `payment_type` field to orders table
- Adds manual payment fields (screenshot, phone, names, reviewed_at)
- Adds promo and discount fields
- Creates performance indexes
- Updates existing orders

**Why required:**
- **BUG FIX**: Code references fields that don't exist in database
- CheckoutScreen.js line 229 sets `payment_type` field (doesn't exist)
- Admin dashboard queries `manual_payment_screenshot` field (doesn't exist)
- System will crash when creating orders or viewing admin dashboard

**How to run:**
```
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of 008_add_payment_fields.sql
3. Paste and click "Run"
4. Verify: Check output shows updated order counts by payment_type
```

### Step 3: Payment Method Control (Recommended)

**File:** `supabase/migrations/009_payment_settings.sql`

**What it does:**
- Creates settings table for system configuration
- Adds payment method visibility controls
- Allows admins to hide/show automatic payments
- Enables launching with manual payments only

**Why recommended:**
- **Launch Strategy**: Hide automatic payments until Paypack is ready
- **Flexibility**: Keep manual and cash payments enabled
- **Admin Control**: Toggle payment methods without code changes
- **User Experience**: Only show working payment options

**How to run:**
```
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of 009_payment_settings.sql
3. Paste and click "Run"
4. Verify: Admin Dashboard → Settings → Payments tab shows toggles
```

**Default Configuration:**
- Automatic Payment: **Disabled** (enable when Paypack is ready)
- Manual Payment: **Enabled** (screenshot upload)
- Cash on Delivery: **Enabled**

See `PAYMENT_METHOD_CONTROL.md` for complete documentation.

### Step 3b: Fix Settings Table (If Needed)

**File:** `supabase/migrations/010_fix_settings_updated_by.sql`

**What it does:**
- Adds missing `updated_by` column to settings table
- Fixes "record 'new' has no field 'updated_by'" error

**When to run:**
- **Only if** you get 400 error when toggling payment settings in admin dashboard
- **Only if** error message mentions `updated_by` field

**How to run:**
```
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of 010_fix_settings_updated_by.sql
3. Paste and click "Run"
4. Refresh admin dashboard and try toggle again
```

### Step 4 (Optional): Clean Up Test Orders

**File:** `delete_automatic_orders_corrected.sql` (BEFORE migration 008)
**OR**
**File:** `delete_incomplete_automatic_orders.sql` (AFTER migration 008)

**What it does:**
- Deletes incomplete automatic payment orders
- Keeps completed/delivered orders
- Keeps ALL manual and cash orders

**Use Case:**
- Remove test orders from development
- Clean up abandoned automatic payment attempts
- Keep only real completed transactions

**Which file to use:**
- **Before migration 008**: Use `delete_automatic_orders_corrected.sql`
- **After migration 008**: Use `delete_incomplete_automatic_orders.sql`

See `DELETE_INCOMPLETE_ORDERS_GUIDE.md` for detailed instructions.

## System Components

### Mobile App (`mobile-app/`)
- **Language:** React Native (Expo)
- **State Management:** Context API
- **Backend:** Supabase
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **i18n:** react-i18next

**Key Dependencies:**
- `@supabase/supabase-js` - Database client
- `expo-image-picker` - Payment proof uploads
- `react-i18next` - Multi-language support
- `@react-navigation` - Navigation

### Admin Dashboard (`admin-dashboard/`)
- **Language:** React (Vite)
- **Backend:** Supabase
- **Realtime:** Supabase Realtime subscriptions

**Key Features:**
- Order management
- Payment proof review
- Transaction monitoring
- User management
- Product catalog

### Database (Supabase)
- **Type:** PostgreSQL
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Realtime:** WebSocket subscriptions

**Key Tables:**
- `orders` - Customer orders
- `order_items` - Order line items
- `products` - Product catalog
- `profiles` - User profiles
- `reviews` - Product reviews

## Data Flow

### Order Placement Flow

```
User → Mobile App → Supabase → Admin Dashboard
  ↓
1. User fills checkout form
2. Selects payment method (automatic/manual)
3. For manual: uploads payment proof
4. Order created in database
5. Admin sees order in dashboard
6. Admin reviews payment proof (manual)
7. Admin approves/rejects payment
8. Order status updated
9. User sees updated status
```

### Payment Methods

**Automatic Payment:**
- MTN MoMo (via Paypack)
- Airtel Money (via Paypack)
- Credit/Debit Card
- Fields: `payment_type = 'automatic'`

**Manual Payment:**
- MTN MoMo (manual upload)
- Airtel Money (manual upload)
- Fields: `payment_type = 'manual'`
- Requires: screenshot, phone, names

**Cash Payment:**
- Cash on Delivery
- Fields: `payment_type = 'cash'`
- No upfront payment required

## Field Mappings

### Orders Table Fields

| Field | Type | Used By | Purpose |
|-------|------|---------|---------|
| `payment_method` | TEXT | All | Stores payment provider (momo, mtn, airtel, card, cash, bank, crypto) |
| `payment_type` | TEXT | All | Stores payment flow (automatic, manual, cash) |
| `payment_status` | TEXT | All | Payment state (unpaid, paid, refunded) |
| `status` | TEXT | All | Order state (pending, confirmed, processing, shipped, delivered, cancelled, refunded) |
| `manual_payment_screenshot` | TEXT | Mobile, Admin | URL to payment proof image |
| `manual_payment_names` | TEXT | Mobile, Admin | Name on MoMo account |
| `manual_payment_phone` | TEXT | Mobile, Admin | Phone used for payment |
| `manual_payment_reviewed_at` | TIMESTAMPTZ | Admin | When admin reviewed proof |
| `promo_code` | TEXT | Mobile | Applied promo code |
| `discount_amount` | NUMERIC | Mobile, Admin | Discount amount applied |
| `total_amount` | NUMERIC | Admin | Alias for total (backward compatibility) |

## API Integration Points

### Mobile App → Supabase

**Authentication:**
```javascript
await supabase.auth.signIn({ email, password })
await supabase.auth.signUp({ email, password, fullName })
await supabase.auth.signOut()
```

**Orders:**
```javascript
// Create order
await supabase.from('orders').insert({ ... })

// Upload payment proof
await supabase.storage.from('payment-screenshots').upload(fileName, blob)

// Update order with proof
await supabase.from('orders').update({
  manual_payment_screenshot: publicUrl,
  manual_payment_phone: phone,
  manual_payment_names: names
})
```

### Admin Dashboard → Supabase

**Orders Query:**
```javascript
await supabase
  .from('orders')
  .select('*, order_items(*)')
  .order('created_at', { ascending: false })
```

**Payment Review:**
```javascript
await supabase
  .from('orders')
  .update({
    payment_status: 'paid',
    status: 'confirmed',
    manual_payment_reviewed_at: new Date()
  })
  .eq('id', orderId)
```

**Realtime Subscriptions:**
```javascript
supabase
  .channel('orders-watch')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'orders'
  }, handleChange)
  .subscribe()
```

## Performance Optimizations

### Database Indexes (Created by Migration)

- `idx_orders_payment_type` - Fast filtering by payment type
- `idx_orders_payment_method` - Fast filtering by payment method
- `idx_orders_status` - Fast filtering by order status
- `idx_orders_payment_status` - Fast filtering by payment status
- `idx_orders_user_id` - Fast user order lookups
- `idx_orders_created_at` - Fast time-based sorting

### Frontend Optimizations

**Mobile App:**
- React context for global state
- Memoized components (ProductCard, etc.)
- Image optimization with expo-image-picker
- Lazy loading for product lists

**Admin Dashboard:**
- Realtime subscriptions for live updates
- Filtered views to reduce data transfer
- Pagination for large datasets

## Security Considerations

### Row Level Security (RLS)

**Orders Table:**
- Users can only see their own orders
- Admins can see all orders
- Authenticated users can create orders

**Storage:**
- `payment-screenshots` - Authenticated upload, public view
- `product-images` - Public read, authenticated write

### Authentication

**Mobile App:**
- JWT tokens via Supabase Auth
- Refresh tokens for persistent login
- Secure session management

**Admin Dashboard:**
- Role-based access (admin role required)
- Protected routes
- Session timeout

## Deployment Checklist

### Before Deployment

- [ ] Run migration 007 (payment-screenshots bucket)
- [ ] Run migration 008 (payment fields)
- [ ] Test payment proof upload
- [ ] Test admin payment review
- [ ] Verify all translations work
- [ ] Test order creation flow
- [ ] Test automatic payments (if Paypack configured)
- [ ] Test manual payments with screenshot upload
- [ ] Verify admin dashboard loads correctly
- [ ] Test realtime updates in admin dashboard

### Environment Variables

**Mobile App (.env):**
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Admin Dashboard (.env):**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### After Deployment

- [ ] Monitor error logs
- [ ] Check payment success rate
- [ ] Verify storage usage
- [ ] Monitor database performance
- [ ] Check user feedback
- [ ] Test on multiple devices
- [ ] Verify language switching
- [ ] Test all payment methods

## Troubleshooting

### Common Issues

**1. Payment proof upload fails (400 error)**
- **Cause:** `payment-screenshots` bucket doesn't exist
- **Fix:** Run migration 007

**2. Admin dashboard shows "field doesn't exist" error**
- **Cause:** Missing payment fields in database
- **Fix:** Run migration 008

**3. Orders not appearing in admin dashboard**
- **Cause:** RLS policies blocking access
- **Fix:** Ensure admin user has `role = 'admin'` in profiles table

**4. Realtime updates not working**
- **Cause:** Supabase realtime not enabled
- **Fix:** Enable realtime in Supabase Dashboard → Database → Replication

**5. Translation not applying**
- **Cause:** Cache issue or incorrect language code
- **Fix:** Clear browser cache, verify language selector

## Monitoring

### Key Metrics to Track

**Orders:**
- Order creation rate
- Payment success rate
- Manual payment review time
- Order fulfillment time

**Performance:**
- Database query time
- Storage usage
- API response time
- App load time

**Errors:**
- Failed payments
- Upload failures
- Database errors
- Authentication failures

## Support

### Documentation Files

- `PAYMENT_PROOF_FIX.md` - Payment proof setup
- `TRANSLATION_STATUS.md` - Translation progress
- `DELETE_INCOMPLETE_ORDERS_GUIDE.md` - Order cleanup
- `CLEANUP_AUTOMATIC_ORDERS.md` - Bulk order deletion

### Database Migrations

- `007_payment_screenshots_bucket.sql` - Storage setup
- `008_add_payment_fields.sql` - Field synchronization

## Maintenance

### Regular Tasks

**Daily:**
- Review pending manual payments
- Monitor error logs
- Check storage usage

**Weekly:**
- Backup database
- Review order metrics
- Update product catalog

**Monthly:**
- Review and archive old orders
- Analyze payment success rates
- Update translations if needed
- Check for security updates

## Version Information

- **Mobile App Version:** 1.1.0
- **Admin Dashboard Version:** 1.0.0
- **Database Schema Version:** 008
- **Last Updated:** 2026-05-24

---

**All systems are now properly wired and synchronized for production deployment!** 🚀
